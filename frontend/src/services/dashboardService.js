import api from "./apiClient";

export const emptyDashboardSummary = {
  generated_at: null,
  service_statistics: {
    total_registered_modules: 0,
    total_tasks: 0,
    active_tasks: 0,
    closed_tasks: 0,
    total_workflows: 0,
    open_workflows: 0,
  },
  workflow_statistics: {
    state_breakdown: [],
    recent_transitions: [],
  },
  approval_statistics: {
    total_approvals: 0,
    approvals_today: 0,
    action_breakdown: [],
  },
  module_activity: [],
  pilot_module_statistics: [],
};

function normalizeSummary(summary = {}) {
  return {
    ...emptyDashboardSummary,
    ...summary,
    service_statistics: {
      ...emptyDashboardSummary.service_statistics,
      ...(summary.service_statistics || {}),
    },
    workflow_statistics: {
      ...emptyDashboardSummary.workflow_statistics,
      ...(summary.workflow_statistics || {}),
      state_breakdown: Array.isArray(
        summary.workflow_statistics?.state_breakdown,
      )
        ? summary.workflow_statistics.state_breakdown
        : [],
      recent_transitions: Array.isArray(
        summary.workflow_statistics?.recent_transitions,
      )
        ? summary.workflow_statistics.recent_transitions
        : [],
    },
    approval_statistics: {
      ...emptyDashboardSummary.approval_statistics,
      ...(summary.approval_statistics || {}),
      action_breakdown: Array.isArray(
        summary.approval_statistics?.action_breakdown,
      )
        ? summary.approval_statistics.action_breakdown
        : [],
    },
    module_activity: Array.isArray(summary.module_activity)
      ? summary.module_activity
      : [],
    pilot_module_statistics: Array.isArray(summary.pilot_module_statistics)
      ? summary.pilot_module_statistics
      : [],
  };
}

export async function fetchDashboardSummary() {
  const response = await api.get("/dashboard/summary");
  return normalizeSummary(response.data?.data || response.data || {});
}

export default { emptyDashboardSummary, fetchDashboardSummary };
