import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/database.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import PengajuanKeGubernur from "../models/PengajuanKeGubernur.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import { buildHierarchicalKpiForThread } from "./executionThreadKpiService.js";

if (!Task.associations?.assignments) {
  Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
}
if (!TaskAssignment.associations?.Task) {
  TaskAssignment.belongsTo(Task, { foreignKey: "task_id" });
}

function normRole(role) {
  return String(role || "").toLowerCase();
}

const TASK_CLOSED = new Set(["closed", "rejected"]);

async function openTaskCountForThread(threadId) {
  return Task.count({
    where: {
      execution_thread_id: String(threadId),
      status: { [Op.notIn]: [...TASK_CLOSED] },
    },
  });
}

export async function buildExecutionThreadCockpitExtensionGubernur(gubernurId) {
  const rows = await InstruksiGubernur.findAll({
    where: {
      created_by: gubernurId,
      execution_thread_id: { [Op.ne]: null },
    },
    attributes: ["execution_thread_id", "id", "judul", "status", "updated_at"],
    order: [["updated_at", "DESC"]],
    limit: 20,
  });
  let belumSelesai = 0;
  for (const r of rows) {
    const st = String(r.status || "");
    if (!["selesai", "draf"].includes(st)) belumSelesai += 1;
  }
  return {
    perspective: "gubernur_semua_level",
    active_threads: rows.length,
    instruksi_belum_selesai: belumSelesai,
    recent_threads: rows.map((r) => ({
      execution_thread_id: r.execution_thread_id,
      instruksi_id: r.id,
      judul: r.judul,
      status: r.status,
    })),
  };
}

export async function buildExecutionThreadCockpitExtensionKadin(kadinId) {
  const rows = await InstruksiGubernur.findAll({
    where: { assigned_to: kadinId, execution_thread_id: { [Op.ne]: null } },
    attributes: ["execution_thread_id", "id", "judul", "status", "updated_at"],
    order: [["updated_at", "DESC"]],
    limit: 25,
  });
  const extra = await sequelize.query(
    `SELECT DISTINCT execution_thread_id AS execution_thread_id FROM Tasks WHERE created_by = :uid AND execution_thread_id IS NOT NULL`,
    { replacements: { uid: kadinId }, type: QueryTypes.SELECT },
  );
  const seen = new Set(rows.map((r) => r.execution_thread_id));
  const merged = [...rows.map((r) => r.toJSON())];
  for (const e of extra) {
    const tid = e.execution_thread_id;
    if (tid && !seen.has(tid)) {
      seen.add(tid);
      merged.push({
        execution_thread_id: tid,
        id: null,
        judul: "(rantai tugas tanpa label instruksi)",
        status: "aktif",
        updated_at: new Date(),
      });
    }
  }
  let aktif = 0;
  for (const r of merged) {
    const st = String(r.status || "");
    if (r.id && !["selesai", "draf"].includes(st)) aktif += 1;
    else if (!r.id) aktif += 1;
  }
  return {
    perspective: "kadis_bawahan",
    threads_tracked: merged.length,
    rantai_aktif_gabungan: aktif,
    recent_threads: merged.slice(0, 20).map((r) => ({
      execution_thread_id: r.execution_thread_id,
      instruksi_id: r.id,
      judul: r.judul,
      status: r.status,
    })),
  };
}

async function threadIdsForSekretarisOrKabidOrUptd(uid, assigneeRole) {
  const tas = await TaskAssignment.findAll({
    where: {
      assignee_user_id: uid,
      assignee_role: assigneeRole,
    },
    include: [
      {
        model: Task,
        required: true,
        attributes: ["execution_thread_id"],
        where: { execution_thread_id: { [Op.ne]: null } },
      },
    ],
  });
  const set = new Set();
  for (const row of tas) {
    const tid = row.Task?.execution_thread_id;
    if (tid) set.add(tid);
  }
  return [...set];
}

export async function buildExecutionHubForUser(user) {
  const uid = Number(user?.id);
  const role = normRole(user?.role);
  if (!uid) {
    return { role_tier: "unknown", threads: [], totals: { threads: 0, open_tasks: 0 } };
  }

  let threadMeta = [];

  const isGubernurPerspective =
    role === "gubernur" || role.includes("gubernur");
  const isKadisPerspective =
    role === "kepala_dinas" || role.includes("kepala_dinas");

  if (role === "super_admin") {
    const rows = await InstruksiGubernur.findAll({
      where: { execution_thread_id: { [Op.ne]: null } },
      attributes: ["execution_thread_id", "id", "judul", "status", "updated_at"],
      order: [["updated_at", "DESC"]],
      limit: 35,
    });
    threadMeta = rows.map((r) => ({
      thread_id: r.execution_thread_id,
      label: r.judul,
      instruksi_id: r.id,
      status: r.status,
      updated_at: r.updated_at,
    }));
  } else if (isGubernurPerspective) {
    const rows = await InstruksiGubernur.findAll({
      where: { created_by: uid, execution_thread_id: { [Op.ne]: null } },
      attributes: ["execution_thread_id", "id", "judul", "status", "updated_at"],
      order: [["updated_at", "DESC"]],
      limit: 35,
    });
    threadMeta = rows.map((r) => ({
      thread_id: r.execution_thread_id,
      label: r.judul,
      instruksi_id: r.id,
      status: r.status,
      updated_at: r.updated_at,
    }));
  } else if (isKadisPerspective) {
    const ext = await buildExecutionThreadCockpitExtensionKadin(uid);
    threadMeta = (ext.recent_threads || []).map((r) => ({
      thread_id: r.execution_thread_id,
      label: r.judul,
      instruksi_id: r.instruksi_id,
      status: r.status,
      updated_at: r.updated_at || new Date(),
    }));
  } else if (role === "sekretaris") {
    const ids = await threadIdsForSekretarisOrKabidOrUptd(uid, "sekretaris");
    for (const tid of ids.slice(0, 40)) {
      const ig = await InstruksiGubernur.findOne({
        where: { execution_thread_id: tid },
        attributes: ["id", "judul", "status", "updated_at"],
      });
      threadMeta.push({
        thread_id: tid,
        label: ig?.judul || `Thread ${tid.slice(0, 8)}…`,
        instruksi_id: ig?.id || null,
        status: ig?.status || "aktif",
        updated_at: ig?.updated_at || new Date(),
      });
    }
  } else if (role.startsWith("kepala_bidang")) {
    const ids = await threadIdsForSekretarisOrKabidOrUptd(uid, role);
    for (const tid of ids.slice(0, 40)) {
      const ig = await InstruksiGubernur.findOne({
        where: { execution_thread_id: tid },
        attributes: ["id", "judul", "status", "updated_at"],
      });
      threadMeta.push({
        thread_id: tid,
        label: ig?.judul || `Thread bidang ${tid.slice(0, 8)}…`,
        instruksi_id: ig?.id || null,
        status: ig?.status || "aktif",
        updated_at: ig?.updated_at || new Date(),
      });
    }
  } else if (role === "kepala_uptd") {
    const ids = await threadIdsForSekretarisOrKabidOrUptd(uid, "kepala_uptd");
    for (const tid of ids.slice(0, 40)) {
      const ig = await InstruksiGubernur.findOne({
        where: { execution_thread_id: tid },
        attributes: ["id", "judul", "status", "updated_at"],
      });
      threadMeta.push({
        thread_id: tid,
        label: ig?.judul || `Thread UPTD ${tid.slice(0, 8)}…`,
        instruksi_id: ig?.id || null,
        status: ig?.status || "aktif",
        updated_at: ig?.updated_at || new Date(),
      });
    }
  } else {
    const peng = await PengajuanKeGubernur.findAll({
      where: { submitted_by: uid, execution_thread_id: { [Op.ne]: null } },
      attributes: ["execution_thread_id", "judul", "status", "updated_at"],
      order: [["updated_at", "DESC"]],
      limit: 20,
    });
    threadMeta = peng.map((r) => ({
      thread_id: r.execution_thread_id,
      label: r.judul,
      instruksi_id: null,
      status: r.status,
      updated_at: r.updated_at,
    }));
  }

  const perspective =
    isGubernurPerspective
      ? "gubernur_semua_level"
      : isKadisPerspective
        ? "kadis_bawahan"
        : role === "sekretaris"
          ? "sekretaris_hub"
          : role.startsWith("kepala_bidang")
            ? "kabid_bidang"
            : role === "kepala_uptd"
              ? "uptd_balai_pengawasan"
              : "lainnya";

  let openTotal = 0;
  const enriched = [];
  for (const m of threadMeta.slice(0, 25)) {
    const open = await openTaskCountForThread(m.thread_id);
    openTotal += open;
    const kpi = await buildHierarchicalKpiForThread(m.thread_id);
    enriched.push({ ...m, open_tasks: open, kpi_hierarki: kpi });
  }

  return {
    perspective,
    role_tier: perspective,
    threads: enriched,
    totals: {
      threads: threadMeta.length,
      open_tasks_sampled: openTotal,
    },
  };
}
