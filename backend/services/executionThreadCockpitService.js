import { Op } from "sequelize";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import User from "../models/User.js";
import { buildExecutionThreadTimeline } from "./executionThreadTimelineService.js";
import { evaluateExecutionThreadHealth } from "./executionThreadHealthService.js";
import { assigneeRoleToOrgLevel } from "./executionThreadOrgLevelUtils.js";

if (!Task.associations?.assignments) {
  Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
}

const TASK_CLOSED = new Set(["closed", "rejected"]);

function groupTimelineByLevel(timeline) {
  const buckets = {
    gubernur: [],
    kadis: [],
    sekretaris: [],
    kabid: [],
    uptd: [],
    pelaksana: [],
    operasional: [],
    lainnya: [],
  };
  for (const ev of timeline) {
    const lv = ev.org_level || "lainnya";
    if (buckets[lv]) buckets[lv].push(ev);
    else buckets.lainnya.push(ev);
  }
  return buckets;
}

async function resolveCurrentOwner(threadId) {
  const t = String(threadId);
  const task = await Task.findOne({
    where: {
      execution_thread_id: t,
      status: { [Op.notIn]: [...TASK_CLOSED] },
    },
    order: [["updated_at", "DESC"]],
    include: [{ model: TaskAssignment, as: "assignments", required: false }],
  });
  if (!task) {
    return {
      label: "Tidak ada penanggung jawab tugas terbuka",
      org_level: null,
      user_id: null,
      role: null,
    };
  }
  const assigns = task.assignments || [];
  const active = assigns.find((a) =>
    ["assigned", "accepted", "in_progress"].includes(String(a.status || "")),
  );
  const pick = active || assigns[0];
  if (!pick) {
    return {
      label: task.title || `Tugas #${task.id}`,
      org_level: "pelaksana",
      user_id: null,
      role: null,
      task_id: task.id,
    };
  }
  let display = pick.assignee_role || "Penanggung jawab";
  let name = null;
  if (pick.assignee_user_id) {
    const u = await User.findByPk(pick.assignee_user_id, {
      attributes: ["id", "nama_lengkap", "name", "email"],
    });
    const j = u?.toJSON?.() || {};
    name = j.nama_lengkap || j.name || j.email;
    if (name) display = `${name} · ${pick.assignee_role || ""}`.trim();
  }
  return {
    label: display,
    org_level: assigneeRoleToOrgLevel(pick.assignee_role),
    user_id: pick.assignee_user_id,
    role: pick.assignee_role,
    task_id: task.id,
    assignment_status: pick.status,
  };
}

/**
 * Paket observabilitas: mandat akar, pemilik saat ini, aksi terakhir, grouping level, health.
 */
export async function buildExecutionThreadCockpit(threadId, options = {}) {
  const t = String(threadId);
  const timeline =
    options.timeline != null
      ? options.timeline
      : await buildExecutionThreadTimeline(t);
  const [health, instruksi, owner] = await Promise.all([
    evaluateExecutionThreadHealth(t),
    InstruksiGubernur.findOne({
      where: { execution_thread_id: t },
      order: [["created_at", "ASC"]],
      attributes: [
        "id",
        "judul",
        "nomor_instruksi",
        "status",
        "deadline",
        "prioritas",
        "jenis",
        "created_at",
      ],
    }),
    resolveCurrentOwner(t),
  ]);

  const last = timeline.length ? timeline[timeline.length - 1] : null;
  const last_action = last
    ? {
        at: last.occurred_at || null,
        summary: last.summary || last.activity || "",
        kind: last.kind || "",
        org_level: last.org_level || null,
        marker: last.marker || null,
      }
    : null;

  const timeline_by_level = groupTimelineByLevel(timeline);

  return {
    mandat_root: instruksi
      ? {
          instruksi_id: instruksi.id,
          judul: instruksi.judul,
          nomor_instruksi: instruksi.nomor_instruksi,
          status: instruksi.status,
          deadline: instruksi.deadline,
          prioritas: instruksi.prioritas,
          jenis: instruksi.jenis,
        }
      : {
          instruksi_id: null,
          judul: null,
          note: "Thread tanpa instruksi Gubernur langsung (rantai tugas / pengajuan).",
        },
    current_owner: owner,
    last_action,
    thread_health: health,
    timeline_by_level,
    timeline_total: timeline.length,
  };
}
