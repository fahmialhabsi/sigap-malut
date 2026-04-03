import { Op } from "sequelize";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import PengajuanKeGubernur from "../models/PengajuanKeGubernur.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import ClarificationThread from "../models/ClarificationThread.js";

function normRole(role) {
  return String(role || "").toLowerCase();
}

/**
 * Akses thread jika user terlibat di instruksi, tugas, pengajuan, assignment, atau peserta klarifikasi.
 */
export async function userCanAccessExecutionThread(user, threadId) {
  const uid = Number(user?.id);
  const role = normRole(user?.role);
  if (!uid || !threadId) return false;
  if (role === "super_admin") return true;

  const t = String(threadId);

  const nInstr = await InstruksiGubernur.count({
    where: {
      execution_thread_id: t,
      [Op.or]: [{ created_by: uid }, { assigned_to: uid }],
    },
  });
  if (nInstr > 0) return true;

  const nPeng = await PengajuanKeGubernur.count({
    where: {
      execution_thread_id: t,
      [Op.or]: [{ submitted_by: uid }, { diputuskan_oleh: uid }],
    },
  });
  if (nPeng > 0) return true;

  const nCreated = await Task.count({
    where: { execution_thread_id: t, created_by: uid },
  });
  if (nCreated > 0) return true;

  const taskIds = await Task.findAll({
    where: { execution_thread_id: t },
    attributes: ["id"],
    raw: true,
  });
  const ids = taskIds.map((r) => r.id);
  if (ids.length) {
    const nAsg = await TaskAssignment.count({
      where: {
        task_id: { [Op.in]: ids },
        assignee_user_id: uid,
      },
    });
    if (nAsg > 0) return true;

    const nRoleAsg = await TaskAssignment.count({
      where: {
        task_id: { [Op.in]: ids },
        assignee_role: role,
      },
    });
    if (nRoleAsg > 0 && role) return true;
  }

  const threads = await ClarificationThread.findAll({
    where: { execution_thread_id: t },
    attributes: ["participant_user_ids"],
  });
  for (const th of threads) {
    const p = th.participant_user_ids;
    if (Array.isArray(p) && p.includes(uid)) return true;
  }

  return false;
}
