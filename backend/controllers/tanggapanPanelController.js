import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

function hasResponse(meta) {
  const m = meta || {};
  const note = m.latest_response_note || m.latestResponseNote;
  return note && String(note).trim().length > 0;
}

// GET /api/panel/tanggapan-dari-bawahan — task yang Anda buat dan sudah ada tanggapan bawahan
export async function listTanggapanDariBawahan(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, error: "unauthenticated" });

    ensureAssoc();
    const limit = Math.min(Number(req.query.limit) || 40, 100);

    const rows = await Task.findAll({
      where: { created_by: uid },
      include: [
        { model: TaskAssignment, as: "assignments", required: false },
      ],
      order: [["updated_at", "DESC"]],
      limit: 200,
    });

    const filtered = rows.filter((t) => hasResponse(t.metadata));
    const slice = filtered.slice(0, limit);

    return res.json({
      success: true,
      data: slice.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        updated_at: t.updated_at,
        response: {
          note: t.metadata?.latest_response_note,
          at: t.metadata?.latest_response_at,
          by_role: t.metadata?.latest_response_by_role,
          by_name: t.metadata?.latest_response_by_name,
        },
        assignments: t.assignments,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
