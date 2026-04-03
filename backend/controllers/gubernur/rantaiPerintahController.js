import { Op } from "sequelize";
import InstruksiGubernur from "../../models/InstruksiGubernur.js";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

async function collectDescendants(rootTasks) {
  const all = [...rootTasks];
  let frontier = rootTasks.map((r) => r.id).filter(Boolean);
  const seen = new Set(frontier);
  while (frontier.length) {
    const kids = await Task.findAll({
      where: { sumber_perintah_kadin: { [Op.in]: frontier } },
      include: [
        { model: TaskAssignment, as: "assignments", required: false },
      ],
    });
    if (!kids.length) break;
    const next = [];
    for (const k of kids) {
      if (!seen.has(k.id)) {
        seen.add(k.id);
        next.push(k.id);
        all.push(k);
      }
    }
    frontier = next;
  }
  return all;
}

function buildTreeNode(task, childrenByParent) {
  const kids = childrenByParent.get(task.id) || [];
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    created_by: task.created_by,
    metadata: task.metadata || {},
    assignments: task.assignments || [],
    children: kids.map((c) => buildTreeNode(c, childrenByParent)),
  };
}

// GET /api/gubernur/instruksi/:id/rantai
export async function getRantaiInstruksi(req, res) {
  try {
    const gubId = req.user?.id;
    const instruksiId = parseInt(req.params.id, 10);
    if (!gubId || !Number.isFinite(instruksiId)) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const ig = await InstruksiGubernur.findByPk(instruksiId);
    if (!ig || ig.created_by !== gubId) {
      return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    }

    ensureAssoc();
    const kadinId = ig.assigned_to;

    const rootCandidates = await Task.findAll({
      where: { created_by: kadinId },
      include: [
        { model: TaskAssignment, as: "assignments", required: false },
      ],
      order: [["created_at", "DESC"]],
    });

    const roots = rootCandidates.filter(
      (t) => Number(t.metadata?.sumber_instruksi_gubernur_id) === instruksiId,
    );

    const flat = await collectDescendants(roots);
    const byId = new Map(flat.map((t) => [t.id, t]));
    const childrenByParent = new Map();
    for (const t of flat) {
      const p = t.sumber_perintah_kadin;
      if (!p) continue;
      if (!childrenByParent.has(p)) childrenByParent.set(p, []);
      childrenByParent.get(p).push(t);
    }

    const trees = roots.map((r) => buildTreeNode(r, childrenByParent));

    return res.json({
      success: true,
      data: {
        instruksi: ig,
        kadin_user_id: kadinId,
        trees,
        flat_count: flat.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
