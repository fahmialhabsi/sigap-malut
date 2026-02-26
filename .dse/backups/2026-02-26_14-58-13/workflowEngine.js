const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Normalize roles against canonical registry if available
let _roleAliasMap = null;
try {
  const rolesFile = path.join(__dirname, "..", "..", "roles.json");
  const rolesData = JSON.parse(fs.readFileSync(rolesFile, "utf8"));
  _roleAliasMap = {};
  if (Array.isArray(rolesData.roles)) {
    rolesData.roles.forEach((r) => {
      if (Array.isArray(r.aliases)) {
        r.aliases.forEach((a) => {
          _roleAliasMap[String(a).toLowerCase()] = r.code;
        });
      }
      // also map the canonical code to itself
      if (r.code) _roleAliasMap[String(r.code).toLowerCase()] = r.code;
    });
  }
} catch (e) {
  // roles registry not available; continue without normalization
}

/**
 * Workflow engine (single workflows object)
 * - `kgb_workflow` retained
 * - `stok_workflow` final
 * - `performTransition` validates and writes to ApprovalLog using
 *   `workflow_id` and `approver_id` per backend/models/approvalLog.js
 */
const workflows = {
  kgb_workflow: {
    states: [
      "draft",
      "diajukan",
      "diverifikasi",
      "disetujui",
      "selesai",
      "arsip",
    ],
    transitions: {
      draft: ["diajukan"],
      diajukan: ["diverifikasi", "ditolak"],
      diverifikasi: ["disetujui", "ditolak"],
      disetujui: ["selesai"],
      selesai: ["arsip"],
    },
    roles: {
      draft: ["staf"],
      diajukan: ["atasan"],
      diverifikasi: ["sekretaris"],
      disetujui: ["kepala_dinas"],
      selesai: ["kepala_dinas"],
    },
  },

  stok_workflow: {
    states: [
      "draft",
      "diajukan",
      "dianalisa",
      "diverifikasi",
      "disetujui",
      "selesai",
      "arsip",
    ],
    transitions: {
      draft: ["diajukan"],
      diajukan: ["dianalisa", "ditolak"],
      dianalisa: ["diverifikasi", "ditolak"],
      diverifikasi: ["disetujui", "ditolak"],
      disetujui: ["selesai"],
      selesai: ["arsip"],
    },
    roles: {
      draft: ["pelaksana"],
      diajukan: ["pelaksana"],
      dianalisa: ["fungsional"],
      diverifikasi: ["kepala_subbagian", "kepala_seksi"],
      disetujui: ["kepala_bidang"],
      selesai: ["kepala_bidang"],
      arsip: ["kepala_bidang"],
    },
    approval_policy: {
      verifiers: ["kepala_bidang"],
      min_approvals: 1,
      escalation_to: "kepala_dinas",
      timeout_days: 7,
    },
  },
};

// If alias map exists, normalize role names in workflows
if (_roleAliasMap) {
  Object.keys(workflows).forEach((wk) => {
    const wf = workflows[wk];
    if (wf && wf.roles) {
      Object.keys(wf.roles).forEach((state) => {
        wf.roles[state] = (wf.roles[state] || []).map((r) => {
          const key = String(r).toLowerCase();
          return _roleAliasMap[key] || r;
        });
      });
    }
    // normalize approval_policy verifiers
    if (
      wf &&
      wf.approval_policy &&
      Array.isArray(wf.approval_policy.verifiers)
    ) {
      wf.approval_policy.verifiers = wf.approval_policy.verifiers.map((r) => {
        const key = String(r).toLowerCase();
        return _roleAliasMap[key] || r;
      });
    }
    if (wf && wf.approval_policy && wf.approval_policy.escalation_to) {
      const key = String(wf.approval_policy.escalation_to).toLowerCase();
      wf.approval_policy.escalation_to =
        _roleAliasMap[key] || wf.approval_policy.escalation_to;
    }
  });
}

async function performTransition({
  app,
  workflowId,
  instance,
  from,
  to,
  user,
  note,
}) {
  const wf = workflows[workflowId];
  if (!wf) throw new Error("workflow_not_found");
  const allowed = (wf.transitions[from] || []).includes(to);
  if (!allowed) throw new Error("invalid_transition");
  const allowedRoles = wf.roles[from] || [];
  if (allowedRoles.length && !allowedRoles.includes(user.role))
    throw new Error("role_not_allowed");

  // update instance status if model provided
  if (instance && typeof instance.update === "function") {
    await instance.update({ status: to });
  }

  // write approval log aligning with backend/models/approvalLog.js
  const { ApprovalLog } = app && app.get ? app.get("models") || {} : {};
  if (ApprovalLog) {
    await ApprovalLog.create({
      // ApprovalLog expects integer PK auto-increment; id may be omitted.
      workflow_id: (instance && instance.id) || null,
      approver_id: user && user.id ? user.id : null,
      approver_role: user && user.role ? user.role : null,
      approval_level: 1,
      action: to,
      notes: note || null,
      created_at: new Date(),
    });
  }

  return true;
}

module.exports = { performTransition, workflows };
