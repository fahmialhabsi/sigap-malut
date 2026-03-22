// pages/SekretariatTasksPage.jsx — Manajemen Tugas/Perintah (full version)
import React, { useEffect, useState, useCallback } from "react";
import { taskService } from "../services/taskService";
import TaskStatusBadge from "../components/tasks/TaskStatusBadge";
import TaskDetail from "../components/tasks/TaskDetail";
import TaskCreateModal from "../components/tasks/TaskCreateModal";
import { notifyError } from "../utils/notify";

const STATUS_FILTER = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "assigned", label: "Ditugaskan" },
  { value: "accepted", label: "Diterima" },
  { value: "in_progress", label: "Sedang Dikerjakan" },
  { value: "submitted", label: "Disubmit" },
  { value: "verified", label: "Terverifikasi" },
  { value: "approved_by_secretary", label: "Disetujui Sekr." },
  { value: "forwarded_to_kadin", label: "Diteruskan Kadin" },
  { value: "closed", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
  { value: "escalated", label: "Dieskalasi" },
];

const PRIORITY_LABEL = {
  1: "🔴 Mendesak",
  2: "🟠 Tinggi",
  3: "🟡 Normal",
  4: "🟢 Rendah",
};

export default function SekretariatTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Read user from localStorage (set by auth module)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user.role || "guest";
  const userId = user.id || user.pegawai_id;

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [tasksRes, summaryRes] = await Promise.all([
        taskService.list(params),
        taskService.summary(),
      ]);
      setTasks(tasksRes.data.data || []);
      setSummary(summaryRes.data.data || null);
    } catch (err) {
      notifyError("Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filtered = tasks.filter(
    (t) =>
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search),
  );

  if (selectedId) {
    return (
      <TaskDetail
        id={selectedId}
        userRole={userRole}
        userId={userId}
        onBack={() => {
          setSelectedId(null);
          loadTasks();
        }}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Manajemen Tugas / Perintah</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
            Kelola alur kerja tugas dan perintah sekretariat
          </p>
        </div>
        {[
          "sekretaris",
          "kepala_bidang",
          "kasubbag",
          "kasubbag_umum",
          "super_admin",
        ].includes(userRole) && (
          <button onClick={() => setShowCreate(true)} style={btnPrimary}>
            + Buat Tugas
          </button>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <SummaryCard
            label="Total"
            value={Object.values(summary.counts || {}).reduce(
              (a, b) => a + b,
              0,
            )}
            color="#2563eb"
          />
          <SummaryCard
            label="Aktif"
            value={
              (summary.counts?.draft || 0) +
              (summary.counts?.assigned || 0) +
              (summary.counts?.accepted || 0) +
              (summary.counts?.in_progress || 0)
            }
            color="#d97706"
          />
          <SummaryCard
            label="Disubmit"
            value={summary.counts?.submitted || 0}
            color="#ea580c"
          />
          <SummaryCard
            label="Selesai"
            value={summary.counts?.closed || 0}
            color="#16a34a"
          />
          <SummaryCard
            label="Ditolak"
            value={summary.counts?.rejected || 0}
            color="#dc2626"
          />
          {summary.overdue > 0 && (
            <SummaryCard
              label="Terlambat"
              value={summary.overdue}
              color="#b91c1c"
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <input
          style={iStyle}
          placeholder="Cari judul / ID tugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={iStyle}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {STATUS_FILTER.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button onClick={loadTasks} style={btnSecondary}>
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          Memuat...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
          Tidak ada tugas ditemukan
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "ID",
                  "Judul",
                  "Status",
                  "Prioritas",
                  "Modul",
                  "Tenggat",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    {t.source_unit && (
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {t.source_unit}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <TaskStatusBadge status={t.status} />
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    {PRIORITY_LABEL[t.priority] || "-"}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12 }}>
                    {t.module || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color:
                        t.due_date &&
                        new Date(t.due_date) < new Date() &&
                        t.status !== "closed"
                          ? "#dc2626"
                          : "#374151",
                    }}
                  >
                    {t.due_date
                      ? new Date(t.due_date).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      style={{
                        padding: "4px 12px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <TaskCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => loadTasks()}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "12px 20px",
        minWidth: 110,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

const iStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 14,
  minWidth: 180,
};
const btnPrimary = {
  padding: "9px 22px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
const btnSecondary = {
  padding: "8px 16px",
  background: "#f1f5f9",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  cursor: "pointer",
};
