import { mockDashboardSummary } from "./mockApi";

export function fetchDashboardSummary() {
  // Simulasi fetch API, bisa diganti dengan fetch asli
  return Promise.resolve(mockDashboardSummary);
}
