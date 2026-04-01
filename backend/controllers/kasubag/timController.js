import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import User from "../../models/User.js";
import UserHierarchy from "../../models/UserHierarchy.js";

function groupInit() {
  return { todo: [], in_progress: [], menunggu_review: [], dikembalikan: [], selesai: [] };
}

function statusToLane(status) {
  if (status === "assigned" || status === "accepted") return "todo";
  if (status === "in_progress") return "in_progress";
  if (status === "submitted") return "menunggu_review";
  if (status === "returned_to_pelaksana") return "dikembalikan";
  if (status === "closed") return "selesai";
  // fallback: biar tidak hilang
  return "todo";
}

// GET /api/kasubag/tim/kanban
export async function getTimSayaKanban(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const rels = await UserHierarchy.findAll({
      where: { atasan_id: actorId, adalah_primer: true },
      attributes: ["bawahan_id"],
      limit: 500,
    }).catch(() => []);
    const bawahanIds = rels.map((r) => r.bawahan_id);
    if (bawahanIds.length === 0) {
      return res.json({ success: true, data: { staff: [], lanes: groupInit() } });
    }

    const staff = await User.findAll({
      where: { id: { [Op.in]: bawahanIds } },
      attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja"],
      order: [["nama_lengkap", "ASC"]],
    }).catch(() => []);

    const assignments = await TaskAssignment.findAll({
      where: { assignee_user_id: { [Op.in]: bawahanIds } },
      attributes: ["task_id", "assignee_user_id", "status", "accepted_at"],
      order: [["created_at", "DESC"]],
      limit: 2000,
    }).catch(() => []);
    const taskIds = Array.from(new Set(assignments.map((a) => a.task_id)));
    const tasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
      order: [["updated_at", "DESC"]],
      limit: 2000,
    }).catch(() => []);
    const byId = new Map(tasks.map((t) => [t.id, t]));

    const lanes = groupInit();

    for (const a of assignments) {
      const t = byId.get(a.task_id);
      if (!t) continue;
      const lane = statusToLane(t.status);
      lanes[lane].push({
        id: t.id,
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        assignee_user_id: a.assignee_user_id,
        revisi_ke: t.revisi_ke ?? 0,
        catatan_verifikasi: t.catatan_verifikasi ?? null,
        updated_at: t.updated_at,
      });
    }

    // Batasi tiap lane biar UI ringan
    for (const k of Object.keys(lanes)) {
      lanes[k] = lanes[k].slice(0, 50);
    }

    return res.json({ success: true, data: { staff, lanes } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

