import { Op } from "sequelize";
import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { isHCoordOpenStatus } from "./horizontalCoordinationStateMachine.js";

function norm(s) {
  return String(s || "").toLowerCase().trim();
}

export function isCoordinationOpenStatus(status) {
  return isHCoordOpenStatus(status);
}

export function isCoordinationOverdueRow(row) {
  if (!row?.sla_due_at) return false;
  if (!isCoordinationOpenStatus(row.status)) return false;
  return new Date(row.sla_due_at).getTime() < Date.now();
}

function bidangTokenFromUser(user) {
  const u = norm(user?.unit_kerja);
  if (u.includes("ketersediaan")) return "ketersediaan";
  if (u.includes("distribusi")) return "distribusi";
  if (u.includes("konsumsi")) return "konsumsi";
  return null;
}

function rowTouchesBidangToken(row, token) {
  if (!token) return false;
  const blob = `${norm(row.from_unit)} ${norm(row.to_org_level)} ${norm(row.to_unit)} ${norm(row.from_org_level)}`;
  return blob.includes(token);
}

function rowTouchesUptd(row, user) {
  const u = norm(user?.unit_kerja);
  const blob = `${norm(row.from_unit)} ${norm(row.to_unit)}`;
  return (
    blob.includes("uptd") ||
    blob.includes("balai") ||
    blob.includes("lab") ||
    (u && blob.includes(u.slice(0, 12)))
  );
}

function applyQueryFilters(rows, query) {
  let out = rows;
  const st = query.status ? norm(query.status) : "";
  if (st) {
    out = out.filter((r) => norm(r.status) === st);
  }
  if (query.sla === "overdue") {
    out = out.filter((r) => isCoordinationOverdueRow(r));
  }
  const lvl = query.level ? norm(query.level) : "";
  if (lvl) {
    out = out.filter((r) => norm(r.from_org_level) === lvl || norm(r.to_org_level) === lvl);
  }
  const unitQ = query.unit ? norm(query.unit) : "";
  if (unitQ) {
    out = out.filter((r) => norm(r.from_unit).includes(unitQ) || norm(r.to_unit).includes(unitQ));
  }
  return out;
}

async function loadCoordinationWindow(limit = 450) {
  return HorizontalCoordinationRequest.findAll({
    order: [["updated_at", "DESC"]],
    limit,
    raw: true,
  });
}

async function userMapForRows(rows) {
  const ids = new Set();
  for (const r of rows) {
    if (r.from_user_id) ids.add(Number(r.from_user_id));
    if (r.to_user_id) ids.add(Number(r.to_user_id));
    if (r.responded_by_user_id) ids.add(Number(r.responded_by_user_id));
  }
  const list = [...ids].filter((n) => Number.isFinite(n) && n > 0);
  if (!list.length) return new Map();
  const users = await User.findAll({
    where: { id: { [Op.in]: list } },
    attributes: ["id", "nama_lengkap", "name", "unit_kerja", "role"],
  });
  const m = new Map();
  for (const u of users) m.set(u.id, u.toJSON());
  return m;
}

function displayName(u) {
  if (!u) return "—";
  return u.nama_lengkap || u.name || `User #${u.id}`;
}

/** Rata-rata waktu respons (ms) per unit penerima, hanya item yang sudah ada responded_at */
function computeSlowestUnits(rows, userMap) {
  const byUnit = new Map();
  for (const r of rows) {
    if (!r.responded_at || !r.created_at) continue;
    const u = norm(r.to_unit) || `user:${r.to_user_id || "—"}`;
    const dt = new Date(r.responded_at) - new Date(r.created_at);
    if (dt < 0) continue;
    if (!byUnit.has(u)) byUnit.set(u, { sum: 0, n: 0, label: r.to_unit || displayName(userMap.get(Number(r.to_user_id))) });
    const b = byUnit.get(u);
    b.sum += dt;
    b.n += 1;
  }
  return [...byUnit.entries()]
    .map(([key, v]) => ({
      unit_key: key,
      label: v.label || key,
      avg_response_hours: v.n ? Math.round((v.sum / v.n / 3600000) * 10) / 10 : 0,
      sample_count: v.n,
    }))
    .sort((a, b) => b.avg_response_hours - a.avg_response_hours)
    .slice(0, 8);
}

function countByFromOrg(rows) {
  const m = new Map();
  for (const r of rows) {
    if (!isCoordinationOpenStatus(r.status)) continue;
    if (!isCoordinationOverdueRow(r)) continue;
    const k = norm(r.from_org_level) || "lainnya";
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()]
    .map(([org_level, overdue_count]) => ({ org_level, overdue_count }))
    .sort((a, b) => b.overdue_count - a.overdue_count);
}

function threadsWithOverdue(rows) {
  const threadIds = new Set();
  for (const r of rows) {
    if (isCoordinationOverdueRow(r)) threadIds.add(r.execution_thread_id);
  }
  return [...threadIds].filter(Boolean).slice(0, 40);
}

function attachActors(row, userMap) {
  return {
    ...row,
    from_user_label: displayName(userMap.get(Number(row.from_user_id))),
    to_user_label: displayName(userMap.get(Number(row.to_user_id))),
  };
}

async function openTasksForThreads(threadIds, limit = 80) {
  if (!threadIds.length) return [];
  const tasks = await Task.findAll({
    where: {
      execution_thread_id: { [Op.in]: threadIds.slice(0, 40) },
      status: { [Op.notIn]: ["closed", "rejected", "verified"] },
    },
    attributes: ["id", "title", "execution_thread_id", "status", "module", "updated_at"],
    order: [["updated_at", "DESC"]],
    limit,
    raw: true,
  });
  return tasks;
}

/**
 * Dashboard koordinasi horizontal — Sekretaris (lintas bidang).
 */
export async function buildSekretarisHorizontalDashboard(user, query = {}) {
  const rows = await loadCoordinationWindow();
  const filtered = applyQueryFilters(rows, query);
  const openRows = filtered.filter((r) => isCoordinationOpenStatus(r.status));
  const overdueRows = openRows.filter((r) => isCoordinationOverdueRow(r));
  const userMap = await userMapForRows(filtered);

  const unresponded = openRows.filter(
    (r) => r.to_user_id && !r.responded_at && norm(r.status) !== "selesai",
  );

  const insights = {
    slowest_responding_units: computeSlowestUnits(rows, userMap),
    bottleneck_by_source_level: countByFromOrg(openRows),
    threads_blocked_by_overdue_coordination: threadsWithOverdue(openRows),
    units_not_responded_count: new Set(
      unresponded.map((r) => norm(r.to_unit) || String(r.to_user_id)),
    ).size,
    cross_bidang_active: openRows.filter(
      (r) => norm(r.from_org_level) === "kabid" || norm(r.to_org_level) === "kabid",
    ).length,
  };

  const fieldTasks = await openTasksForThreads(insights.threads_blocked_by_overdue_coordination, 40);

  const priority = [...openRows]
    .sort((a, b) => {
      const oa = isCoordinationOverdueRow(a) ? 1 : 0;
      const ob = isCoordinationOverdueRow(b) ? 1 : 0;
      if (ob !== oa) return ob - oa;
      return new Date(b.updated_at) - new Date(a.updated_at);
    })
    .slice(0, 30)
    .map((r) => attachActors(r, userMap));

  return {
    role_lens: "sekretaris",
    summary: {
      coordination_active: openRows.length,
      coordination_overdue: overdueRows.length,
      awaiting_response: unresponded.length,
      threads_with_overdue_sla: insights.threads_blocked_by_overdue_coordination.length,
      cross_bidang_open: insights.cross_bidang_active,
    },
    priority_queue: priority,
    critical_overdue: overdueRows.slice(0, 20).map((r) => attachActors(r, userMap)),
    field_tasks_linked: fieldTasks,
    insights,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Dashboard — Kepala Bidang.
 */
export async function buildKabidHorizontalDashboard(user, query = {}) {
  const token = bidangTokenFromUser(user);
  const uid = Number(user?.id);
  const rows = await loadCoordinationWindow();
  const scoped = rows.filter(
    (r) =>
      (Number(r.to_user_id) === uid || Number(r.from_user_id) === uid) ||
      rowTouchesBidangToken(r, token),
  );
  const filtered = applyQueryFilters(scoped, query);
  const openRows = filtered.filter((r) => isCoordinationOpenStatus(r.status));
  const overdueRows = openRows.filter((r) => isCoordinationOverdueRow(r));
  const userMap = await userMapForRows(filtered);

  const incoming = openRows.filter((r) => Number(r.to_user_id) === uid);
  const outgoing = openRows.filter((r) => Number(r.from_user_id) === uid);

  const insights = {
    slowest_responding_units: computeSlowestUnits(scoped, userMap),
    bottleneck_bidang_level: countByFromOrg(openRows),
    threads_waiting_this_bidang: [
      ...new Set(
        openRows
          .filter((r) => Number(r.to_user_id) === uid || rowTouchesBidangToken(r, token))
          .map((r) => r.execution_thread_id),
      ),
    ].filter(Boolean).slice(0, 25),
    uptd_support_suggested: openRows.filter((r) => rowTouchesUptd(r, user)).length,
    coordination_load: openRows.length,
  };

  const priority = [...openRows]
    .sort((a, b) => (isCoordinationOverdueRow(b) ? 1 : 0) - (isCoordinationOverdueRow(a) ? 1 : 0))
    .slice(0, 25)
    .map((r) => attachActors(r, userMap));

  return {
    role_lens: "kabid",
    bidang_token: token,
    summary: {
      cross_unit_active: openRows.length,
      overdue_coordination: overdueRows.length,
      incoming_open: incoming.length,
      outgoing_open: outgoing.length,
      open_dependency_threads: insights.threads_waiting_this_bidang.length,
      workload_open: openRows.length,
    },
    priority_queue: priority,
    incoming_highlight: incoming.slice(0, 12).map((r) => attachActors(r, userMap)),
    outgoing_highlight: outgoing.slice(0, 12).map((r) => attachActors(r, userMap)),
    insights,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Dashboard — Kepala UPTD.
 */
export async function buildUptdHorizontalDashboard(user, query = {}) {
  const uid = Number(user?.id);
  const rows = await loadCoordinationWindow();
  const scoped = rows.filter(
    (r) => Number(r.to_user_id) === uid || Number(r.from_user_id) === uid || rowTouchesUptd(r, user),
  );
  const filtered = applyQueryFilters(scoped, query);
  const openRows = filtered.filter((r) => isCoordinationOpenStatus(r.status));
  const overdueRows = openRows.filter((r) => isCoordinationOverdueRow(r));
  const userMap = await userMapForRows(filtered);

  const threadIds = [...new Set(openRows.map((r) => r.execution_thread_id))].filter(Boolean);
  const fieldTasks = await openTasksForThreads(threadIds, 50);

  const insights = {
    backlog_from_other_units: openRows.filter((r) => Number(r.from_user_id) !== uid).length,
    threads_awaiting_uptd: threadIds.slice(0, 20),
    verification_style_open: openRows.filter((r) =>
      norm(r.coordination_kind).includes("verif"),
    ).length,
  };

  const priority = [...openRows]
    .sort((a, b) => (isCoordinationOverdueRow(b) ? 1 : 0) - (isCoordinationOverdueRow(a) ? 1 : 0))
    .slice(0, 25)
    .map((r) => attachActors(r, userMap));

  return {
    role_lens: "uptd",
    summary: {
      field_coordination_active: openRows.length,
      overdue_response: overdueRows.length,
      verification_pending_guess: insights.verification_style_open,
      threads_waiting_uptd: insights.threads_awaiting_uptd.length,
      backlog_external: insights.backlog_from_other_units,
    },
    priority_queue: priority,
    field_tasks: fieldTasks,
    insights,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Ringkasan eksekutif — Gubernur / Kepala Dinas.
 */
export async function buildExecutiveHorizontalRollup(user, query = {}) {
  const rows = await loadCoordinationWindow();
  const filtered = applyQueryFilters(rows, query);
  const openRows = filtered.filter((r) => isCoordinationOpenStatus(r.status));
  const overdueRows = openRows.filter((r) => isCoordinationOverdueRow(r));
  const userMap = await userMapForRows(filtered);

  const systemic = {
    total_open_horizontal: openRows.length,
    overdue_horizontal: overdueRows.length,
    distinct_threads_touched: new Set(openRows.map((r) => r.execution_thread_id)).size,
    top_slow_units: computeSlowestUnits(rows, userMap).slice(0, 5),
    bottleneck_levels: countByFromOrg(openRows).slice(0, 5),
  };

  const riskThreads = threadsWithOverdue(openRows);

  return {
    role_lens: "executive",
    summary: systemic,
    high_risk_threads: riskThreads,
    sample_critical: overdueRows.slice(0, 12).map((r) => attachActors(r, userMap)),
    generated_at: new Date().toISOString(),
  };
}
