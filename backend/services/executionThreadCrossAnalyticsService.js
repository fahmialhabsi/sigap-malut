import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Analitik lintas thread (PostgreSQL). Ringkas & cache-friendly.
 */
export async function buildCrossThreadAnalyticsSnapshot() {
  const dialect = sequelize.getDialect();
  if (dialect !== "postgres") {
    return {
      ok: false,
      reason: "unsupported_dialect",
      top_bottleneck_users: [],
      top_problematic_units: [],
      sla_open_overdue_distribution: { none: 0, low: 0, medium: 0, high: 0 },
      workload_open_by_unit: [],
      threads_with_stale_activity_7d_plus: 0,
    };
  }

  const top_bottleneck_users = await sequelize.query(
    `SELECT ta.assignee_user_id AS user_id,
            COALESCE(NULLIF(TRIM(u.nama_lengkap), ''), NULLIF(TRIM(u.name), ''), u.email, '(tanpa nama)') AS display_name,
            COUNT(*)::int AS risk_task_count
     FROM "TaskAssignments" ta
     INNER JOIN "Tasks" t ON t.id = ta.task_id
     LEFT JOIN users u ON u.id = ta.assignee_user_id
     WHERE t.execution_thread_id IS NOT NULL
       AND t.status NOT IN ('closed', 'rejected')
       AND ta.assignee_user_id IS NOT NULL
       AND (
         (t.due_date IS NOT NULL AND t.due_date < NOW())
         OR t.status = 'escalated'
       )
     GROUP BY ta.assignee_user_id, u.nama_lengkap, u.name, u.email
     ORDER BY risk_task_count DESC
     LIMIT 10`,
    { type: QueryTypes.SELECT },
  );

  const top_problematic_units = await sequelize.query(
    `SELECT COALESCE(NULLIF(TRIM(source_unit), ''), '(tanpa source_unit)') AS unit_label,
            COUNT(*)::int AS overdue_open_tasks
     FROM "Tasks"
     WHERE execution_thread_id IS NOT NULL
       AND status NOT IN ('closed', 'rejected')
       AND due_date IS NOT NULL
       AND due_date < NOW()
     GROUP BY 1
     ORDER BY overdue_open_tasks DESC
     LIMIT 12`,
    { type: QueryTypes.SELECT },
  );

  const workload_open_by_unit = await sequelize.query(
    `SELECT COALESCE(NULLIF(TRIM(source_unit), ''), '(tanpa source_unit)') AS unit_label,
            COUNT(*)::int AS open_tasks
     FROM "Tasks"
     WHERE execution_thread_id IS NOT NULL
       AND status NOT IN ('closed', 'rejected')
     GROUP BY 1
     ORDER BY open_tasks DESC
     LIMIT 12`,
    { type: QueryTypes.SELECT },
  );

  const distRows = await sequelize.query(
    `SELECT
       SUM(CASE WHEN c = 0 THEN 1 ELSE 0 END)::int AS bucket_none,
       SUM(CASE WHEN c BETWEEN 1 AND 2 THEN 1 ELSE 0 END)::int AS bucket_low,
       SUM(CASE WHEN c BETWEEN 3 AND 5 THEN 1 ELSE 0 END)::int AS bucket_medium,
       SUM(CASE WHEN c >= 6 THEN 1 ELSE 0 END)::int AS bucket_high
     FROM (
       SELECT execution_thread_id, COUNT(*)::int AS c
       FROM "Tasks"
       WHERE execution_thread_id IS NOT NULL
         AND status NOT IN ('closed', 'rejected')
         AND due_date IS NOT NULL
         AND due_date < NOW()
       GROUP BY execution_thread_id
     ) x`,
    { type: QueryTypes.SELECT },
  );

  const d0 = distRows[0] || {};
  const sla_open_overdue_distribution = {
    none: Number(d0.bucket_none || 0),
    low: Number(d0.bucket_low || 0),
    medium: Number(d0.bucket_medium || 0),
    high: Number(d0.bucket_high || 0),
  };

  const staleThreads = await sequelize.query(
    `SELECT COUNT(*)::int AS n
     FROM (
       SELECT execution_thread_id
       FROM "Tasks"
       WHERE execution_thread_id IS NOT NULL
       GROUP BY execution_thread_id
       HAVING MAX(updated_at) < NOW() - INTERVAL '7 days'
     ) z`,
    { type: QueryTypes.SELECT },
  );

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    top_bottleneck_users,
    top_problematic_units,
    workload_open_by_unit,
    sla_open_overdue_distribution,
    threads_with_stale_activity_7d_plus: Number(staleThreads[0]?.n || 0),
  };
}
