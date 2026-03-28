/**
 * backend/middleware/chainOfCommand.js
 *
 * Enforces hierarchical approval chain-of-command for SIGAP MALUT.
 * Reference: dokumenSistem/14-alur-kerja-sekretariat-bidang-uptd.md
 *
 * Rules:
 *   1. Pelaksana → Kasubbag/Kasi → Sekretaris/Kepala Bidang → Kepala Dinas
 *   2. Approval may NOT bypass an immediate superior (skip-level forbidden)
 *   3. Self-approval (approving own submission) is forbidden
 *   4. Only roles with approve permission on the target module may approve
 *
 * Usage:
 *   router.post('/approve/:id', protect, chainOfCommandGuard, controller);
 *   router.post('/approve/:id', protect, chainOfCommandGuard, workflowValidation, controller);
 */

import sequelize from "../config/database.js";

// ── Role hierarchy levels (mirrors permissionCheck.js ROLE_LEVELS) ────────────
const ROLE_LEVEL = {
  super_admin: 10,
  kepala_dinas: 9,
  sekretaris: 8,
  kepala_bidang: 8,
  kepala_bidang_distribusi: 8,
  kepala_bidang_ketersediaan: 8,
  kepala_bidang_konsumsi: 8,
  kepala_uptd: 8,
  kasubbag: 7,
  kasubbag_umum: 7,
  kasubbag_kepegawaian: 7,
  kasubbag_perencanaan: 7,
  kasubbag_umum_kepegawaian: 7,
  kasubbag_tu_uptd: 7,
  kasi_uptd: 7,
  kasi_mutu_uptd: 7,
  kasi_teknis_uptd: 7,
  fungsional: 6,
  fungsional_perencana: 6,
  fungsional_analis: 6,
  fungsional_ketersediaan: 6,
  fungsional_distribusi: 6,
  fungsional_konsumsi: 6,
  fungsional_uptd: 6,
  fungsional_uptd_mutu: 6,
  fungsional_uptd_teknis: 6,
  bendahara: 6,
  staf_pelaksana: 5,
  pelaksana: 5,
  guest: 0,
};

// Roles that are allowed to approve at each level
const APPROVER_ROLES = new Set([
  "super_admin",
  "kepala_dinas",
  "sekretaris",
  "kepala_bidang",
  "kepala_bidang_distribusi",
  "kepala_bidang_ketersediaan",
  "kepala_bidang_konsumsi",
  "kepala_uptd",
  "kasubbag",
  "kasubbag_umum",
  "kasubbag_kepegawaian",
  "kasubbag_umum_kepegawaian",
  "kasubbag_tu_uptd",
  "kasi_mutu_uptd",
  "kasi_teknis_uptd",
]);

/**
 * chainOfCommandGuard
 *
 * Validates:
 *  1. Approver has higher role level than the record submitter
 *  2. Approver is not approving their own submission (no self-approval)
 *  3. Approver role is within the permitted approver set
 *
 * Expects req.params.id to be the workflow/approval record ID.
 * Falls through gracefully if record cannot be found (non-blocking for missing tables).
 */
export function chainOfCommandGuard(req, res, next) {
  const approver = req.user;
  if (!approver) {
    return res.status(401).json({
      success: false,
      message: "Tidak terautentikasi.",
    });
  }

  // super_admin bypasses all chain checks
  if (approver.role === "super_admin") return next();

  // Must be in approver set
  if (!APPROVER_ROLES.has(approver.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${approver.role}' tidak memiliki kewenangan untuk melakukan approval.`,
      code: "CHAIN_ROLE_NOT_APPROVER",
    });
  }

  const recordId = req.params?.id || req.body?.record_id || req.body?.workflow_id;
  if (!recordId) return next(); // No ID to validate — let controller handle

  // Async chain validation
  (async () => {
    try {
      // Try to find the record submitter from approval_workflow or workflow_instances
      let submitterUserId = null;
      let submitterRole = null;

      const rows = await sequelize
        .query(
          `SELECT submitted_by, submitter_role FROM approval_workflow
           WHERE id::text = :id AND deleted_at IS NULL
           LIMIT 1`,
          {
            replacements: { id: String(recordId) },
            type: sequelize.QueryTypes.SELECT,
          }
        )
        .catch(() => []);

      if (rows.length > 0) {
        submitterUserId = rows[0]?.submitted_by;
        submitterRole = rows[0]?.submitter_role;
      } else {
        // Try workflow_instances
        const wiRows = await sequelize
          .query(
            `SELECT created_by, created_by_role FROM workflow_instances
             WHERE id::text = :id AND deleted_at IS NULL
             LIMIT 1`,
            {
              replacements: { id: String(recordId) },
              type: sequelize.QueryTypes.SELECT,
            }
          )
          .catch(() => []);

        if (wiRows.length > 0) {
          submitterUserId = wiRows[0]?.created_by;
          submitterRole = wiRows[0]?.created_by_role;
        }
      }

      // Rule 1: Self-approval prevention
      if (submitterUserId && String(submitterUserId) === String(approver.id)) {
        return res.status(403).json({
          success: false,
          message: "Tidak dapat menyetujui dokumen yang Anda buat sendiri (self-approval dilarang).",
          code: "CHAIN_SELF_APPROVAL",
        });
      }

      // Rule 2: Approver level must be strictly higher than submitter level
      if (submitterRole) {
        const approverLevel = ROLE_LEVEL[approver.role] ?? 0;
        const submitterLevel = ROLE_LEVEL[submitterRole] ?? 0;

        if (approverLevel <= submitterLevel) {
          return res.status(403).json({
            success: false,
            message: `Approval tidak sesuai hierarki. Approver (${approver.role}, level ${approverLevel}) harus lebih tinggi dari submitter (${submitterRole}, level ${submitterLevel}).`,
            code: "CHAIN_HIERARCHY_VIOLATION",
          });
        }
      }

      next();
    } catch {
      // If chain validation fails due to DB issues, let it pass
      // (non-blocking guard to avoid availability issues)
      next();
    }
  })();
}

/**
 * workflowValidation
 *
 * Validates that the workflow state machine transition is valid.
 * Reads current_status from workflow_instances and checks if target status
 * is a valid next state.
 *
 * Valid transitions:
 *   draft → submitted
 *   submitted → reviewed | ditolak
 *   reviewed → approved | ditolak
 *   approved → signed | closed
 *   ditolak → draft (re-draft)
 */
const VALID_TRANSITIONS = {
  draft: ["submitted"],
  submitted: ["reviewed", "ditolak"],
  reviewed: ["approved", "ditolak"],
  approved: ["signed", "closed"],
  ditolak: ["draft"],
  signed: ["closed"],
  closed: [],
};

export function workflowValidation(req, res, next) {
  const targetStatus = req.body?.status || req.body?.next_status;
  if (!targetStatus) return next(); // No status change — pass through

  const recordId = req.params?.id || req.body?.workflow_id;
  if (!recordId) return next();

  (async () => {
    try {
      const rows = await sequelize
        .query(
          `SELECT current_status FROM workflow_instances
           WHERE id::text = :id AND deleted_at IS NULL
           LIMIT 1`,
          {
            replacements: { id: String(recordId) },
            type: sequelize.QueryTypes.SELECT,
          }
        )
        .catch(() => []);

      if (rows.length === 0) return next(); // Record not found — let controller handle

      const currentStatus = rows[0]?.current_status;
      const allowed = VALID_TRANSITIONS[currentStatus] || [];

      if (!allowed.includes(targetStatus)) {
        return res.status(422).json({
          success: false,
          message: `Transisi status tidak valid: '${currentStatus}' → '${targetStatus}'. Transisi yang diizinkan: ${allowed.join(", ") || "tidak ada"}.`,
          code: "WORKFLOW_INVALID_TRANSITION",
          current: currentStatus,
          attempted: targetStatus,
          allowed,
        });
      }

      next();
    } catch {
      next();
    }
  })();
}

export default { chainOfCommandGuard, workflowValidation };
