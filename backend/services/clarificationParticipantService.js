import InstruksiGubernur from "../models/InstruksiGubernur.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";

if (!Task.associations?.assignments) {
  Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
}

/** Jalur diskusi (label UI + aturan anchor). */
export const CLARIFICATION_LANES = {
  GUBERNUR_KADIN: "gubernur_kadin",
  KADIN_ES3: "kadin_es3",
  ES3_ES4: "es3_es4",
  ES4_OPERATOR: "es4_operator",
};

const ANCHOR = {
  INSTRUKSI_GUBERNUR: "instruksi_gubernur",
  TASK: "task",
};

export async function resolveParticipantUserIds(anchor_type, anchor_id) {
  if (anchor_type === ANCHOR.INSTRUKSI_GUBERNUR) {
    const ig = await InstruksiGubernur.findByPk(Number(anchor_id));
    if (!ig) return [];
    return [ig.created_by, ig.assigned_to].filter(Boolean);
  }
  if (anchor_type === ANCHOR.TASK) {
    const task = await Task.findByPk(Number(anchor_id), {
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: false,
        },
      ],
    });
    if (!task) return [];
    const ids = new Set([task.created_by]);
    const rows = task.assignments || [];
    for (const a of rows) {
      if (a.assignee_user_id) ids.add(a.assignee_user_id);
    }
    return [...ids];
  }
  return [];
}

export function assertLaneMatchesAnchor(anchor_type, lane) {
  if (lane === CLARIFICATION_LANES.GUBERNUR_KADIN) {
    return anchor_type === ANCHOR.INSTRUKSI_GUBERNUR;
  }
  if (
    lane === CLARIFICATION_LANES.KADIN_ES3 ||
    lane === CLARIFICATION_LANES.ES3_ES4 ||
    lane === CLARIFICATION_LANES.ES4_OPERATOR
  ) {
    return anchor_type === ANCHOR.TASK;
  }
  return false;
}

export { ANCHOR };
