// Mock KPI & Alerts for Super Admin Dashboard
export const superAdminKpis = [
  {
    id: "compliance",
    label: "Compliance Alur Koordinasi",
    value: "94%",
    delta: 2,
    trend: [85, 88, 92, 94],
    unit: "%",
    status: "ok",
  },
  {
    id: "bypass_count",
    label: "Bypass Violations (30d)",
    value: 3,
    delta: -1,
    trend: [5, 4, 3, 3],
    unit: "",
    status: "warn",
  },
  {
    id: "avg_approval_time",
    label: "Avg Approval Sekretaris",
    value: 12,
    delta: -3,
    trend: [18, 15, 14, 12],
    unit: "jam",
    status: "ok",
  },
  {
    id: "kgb_alerts",
    label: "KGB Alerts",
    value: 5,
    delta: 1,
    trend: [2, 3, 4, 5],
    unit: "",
    status: "warn",
  },
  {
    id: "komoditas_consistency",
    label: "Konsistensi Komoditas",
    value: "100%",
    delta: 0,
    trend: [98, 99, 100, 100],
    unit: "%",
    status: "ok",
  },
  {
    id: "inflasi",
    label: "Inflasi Pangan",
    value: 2.35,
    delta: 0.1,
    trend: [2.1, 2.2, 2.25, 2.35],
    unit: "%",
    status: "ok",
  },
];

export const superAdminAlerts = [
  {
    id: "a1",
    severity: "critical",
    title: "KGB Terlambat: Siti",
    summary: "Terlewat 59 hari",
  },
  {
    id: "a2",
    severity: "warning",
    title: "Bypass detected",
    summary: "Bendahara submit SPJ langsung ke Kadis",
  },
];
