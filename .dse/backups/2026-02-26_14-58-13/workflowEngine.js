const { v4: uuidv4 } = require("uuid");

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
