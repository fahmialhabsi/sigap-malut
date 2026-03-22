// components/tasks/TaskStatusBadge.jsx
import React from "react";

const CONFIG = {
  draft: { label: "Draft", bg: "#e2e8f0", color: "#475569" },
  assigned: { label: "Ditugaskan", bg: "#dbeafe", color: "#1d4ed8" },
  accepted: { label: "Diterima", bg: "#ede9fe", color: "#7c3aed" },
  in_progress: { label: "Sedang Dikerjakan", bg: "#fef3c7", color: "#d97706" },
  submitted: { label: "Disubmit", bg: "#fed7aa", color: "#c2410c" },
  verified: { label: "Terverifikasi", bg: "#d1fae5", color: "#065f46" },
  approved_by_secretary: {
    label: "Disetujui Sekr.",
    bg: "#a7f3d0",
    color: "#047857",
  },
  forwarded_to_kadin: {
    label: "Diteruskan Kadin",
    bg: "#bbf7d0",
    color: "#166534",
  },
  closed: { label: "Selesai", bg: "#dcfce7", color: "#15803d" },
  rejected: { label: "Ditolak", bg: "#fee2e2", color: "#b91c1c" },
  escalated: { label: "Dieskalasi", bg: "#fce7f3", color: "#be185d" },
};

export default function TaskStatusBadge({ status }) {
  const cfg = CONFIG[status] || {
    label: status,
    bg: "#f1f5f9",
    color: "#64748b",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.label}
    </span>
  );
}
