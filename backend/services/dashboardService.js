import { fn, col, literal, Op } from "sequelize";
import ApprovalLog from "../models/approvalLog.js";
import AuditLog from "../models/auditLog.js";
import Task from "../models/Task.js";
import WorkflowHistory from "../models/WorkflowHistory.js";
import WorkflowInstance from "../models/WorkflowInstance.js";
import { listMasterDataModules } from "./moduleGeneratorService.js";

const PILOT_MODULES = ["SEK-ADM", "SEK-KEU", "BKT-KBJ", "BDS-HRG", "BKS-DVR"];

function toNumber(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function safeQuery(run, fallbackValue) {
  try {
    return await run();
  } catch (_error) {
    return fallbackValue;
  }
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function getServiceStatistics() {
  const [
    registry,
    totalTasks,
    closedTasks,
    activeTasks,
    totalWorkflows,
    openWorkflows,
  ] = await Promise.all([
    safeQuery(() => listMasterDataModules(), {
      summary: { domain_modules: 0, ui_modules: 0 },
    }),
    safeQuery(() => Task.count(), 0),
    safeQuery(() => Task.count({ where: { status: "closed" } }), 0),
    safeQuery(
      () =>
        Task.count({
          where: {
            status: {
              [Op.in]: [
                "draft",
                "assigned",
                "in_progress",
                "submitted",
                "verified",
              ],
            },
          },
        }),
      0,
    ),
    safeQuery(() => WorkflowInstance.count(), 0),
    safeQuery(
      () =>
        WorkflowInstance.count({
          where: {
            status: "active",
          },
        }),
      0,
    ),
  ]);

  return {
    total_registered_modules:
      toNumber(registry?.summary?.domain_modules) +
      toNumber(registry?.summary?.ui_modules),
    total_tasks: toNumber(totalTasks),
    active_tasks: toNumber(activeTasks),
    closed_tasks: toNumber(closedTasks),
    total_workflows: toNumber(totalWorkflows),
    open_workflows: toNumber(openWorkflows),
  };
}

async function getWorkflowStatistics() {
  const [stateBreakdownRows, recentTransitions] = await Promise.all([
    safeQuery(
      () =>
        WorkflowInstance.findAll({
          attributes: [
            [col("current_state"), "state"],
            [fn("COUNT", col("id")), "total"],
          ],
          group: ["current_state"],
          raw: true,
        }),
      [],
    ),
    safeQuery(
      () =>
        WorkflowHistory.findAll({
          attributes: [
            "id",
            "module_id",
            "entity_id",
            "from_state",
            "to_state",
            "actor_role",
            "created_at",
          ],
          order: [["created_at", "DESC"]],
          limit: 10,
          raw: true,
        }),
      [],
    ),
  ]);

  return {
    state_breakdown: stateBreakdownRows.map((row) => ({
      state: row.state,
      total: toNumber(row.total),
    })),
    recent_transitions: recentTransitions,
  };
}

async function getApprovalStatistics() {
  const [totalApprovals, todayApprovals, actionRows] = await Promise.all([
    safeQuery(() => ApprovalLog.count(), 0),
    safeQuery(
      () =>
        ApprovalLog.count({
          where: {
            created_at: {
              [Op.gte]: startOfToday(),
            },
          },
        }),
      0,
    ),
    safeQuery(
      () =>
        ApprovalLog.findAll({
          attributes: [
            [col("action"), "action"],
            [fn("COUNT", col("id")), "total"],
          ],
          group: ["action"],
          raw: true,
        }),
      [],
    ),
  ]);

  return {
    total_approvals: toNumber(totalApprovals),
    approvals_today: toNumber(todayApprovals),
    action_breakdown: actionRows.map((row) => ({
      action: row.action,
      total: toNumber(row.total),
    })),
  };
}

async function getModuleActivity() {
  const rows = await safeQuery(
    () =>
      AuditLog.findAll({
        attributes: [
          [col("modul"), "module_id"],
          [fn("COUNT", col("id")), "total_events"],
          [fn("MAX", col("created_at")), "last_event_at"],
        ],
        group: ["modul"],
        order: [[literal("total_events"), "DESC"]],
        limit: 12,
        raw: true,
      }),
    [],
  );

  return rows.map((row) => ({
    module_id: row.module_id,
    total_events: toNumber(row.total_events),
    last_event_at: row.last_event_at || null,
  }));
}

async function getPilotModuleStatistics() {
  const [workflowRows, eventRows] = await Promise.all([
    safeQuery(
      () =>
        WorkflowInstance.findAll({
          attributes: [
            "module_id",
            [fn("COUNT", col("id")), "total_workflows"],
            [
              fn(
                "SUM",
                literal("CASE WHEN status = 'active' THEN 1 ELSE 0 END"),
              ),
              "open_workflows",
            ],
          ],
          where: {
            module_id: {
              [Op.in]: PILOT_MODULES,
            },
          },
          group: ["module_id"],
          raw: true,
        }),
      [],
    ),
    safeQuery(
      () =>
        AuditLog.findAll({
          attributes: [
            [col("modul"), "module_id"],
            [fn("COUNT", col("id")), "total_events"],
          ],
          where: {
            modul: {
              [Op.in]: PILOT_MODULES,
            },
          },
          group: ["modul"],
          raw: true,
        }),
      [],
    ),
  ]);

  const workflowMap = new Map(
    workflowRows.map((row) => [
      row.module_id,
      {
        total_workflows: toNumber(row.total_workflows),
        open_workflows: toNumber(row.open_workflows),
      },
    ]),
  );
  const eventMap = new Map(
    eventRows.map((row) => [row.module_id, toNumber(row.total_events)]),
  );

  return PILOT_MODULES.map((moduleId) => ({
    module_id: moduleId,
    total_workflows: workflowMap.get(moduleId)?.total_workflows || 0,
    open_workflows: workflowMap.get(moduleId)?.open_workflows || 0,
    total_events: eventMap.get(moduleId) || 0,
  }));
}

export async function getDashboardSummary() {
  const [
    service_statistics,
    workflow_statistics,
    approval_statistics,
    module_activity,
    pilot_module_statistics,
  ] = await Promise.all([
    getServiceStatistics(),
    getWorkflowStatistics(),
    getApprovalStatistics(),
    getModuleActivity(),
    getPilotModuleStatistics(),
  ]);

  return {
    generated_at: new Date().toISOString(),
    service_statistics,
    workflow_statistics,
    approval_statistics,
    module_activity,
    pilot_module_statistics,
  };
}

// Backward-compatible export for older callers/tests.
export async function getAggregatedData() {
  return getDashboardSummary();
}

export default { getAggregatedData, getDashboardSummary };
