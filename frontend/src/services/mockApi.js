export const mockDashboardSummary = {
  kpis: [
    {
      id: "compliance",
      label: "Compliance Alur Koordinasi",
      value: 0.94,
      unit: "ratio",
      trend: [0.85, 0.88, 0.92, 0.94],
      source: "audit_log",
    },
    { id: "kgb_alerts", label: "KGB Alerts", value: 5, unit: "count" },
  ],
  alerts: [
    {
      id: "a1",
      severity: "critical",
      title: "KGB Terlambat: Siti",
      summary: "Terlewat 59 hari",
    },
  ],
};
