// frontend/src/pages/dashboard/pelaksana-uptd.jsx
// Role: pelaksana | Unit: UPTD Balai Pengawasan

import { useState, useEffect, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const T = {
  primary: "#1B4F8A",
  secondary: "#2E7D32",
  accent: "#F57C00",
  danger: "#C62828",
  warning: "#E65100",
  success: "#2E7D32",
  info: "#0277BD",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  border: "#DDE3ED",
  textPri: "#1A2B3C",
  textSec: "#546E7A",
};

const ALLOWED = [
  "pelaksana",
  "staf",
  "staf_pelaksana",
  "uptd",
  "super_admin",
  "kepala_dinas",
  "kepala_uptd",
  "kasubag_uptd",
  "kasubbag_tu_uptd",
  "subbag_tata_usaha",
];

const TABS = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "tugas", label: "Tugas Saya" },
  { id: "modul", label: "Modul Kerja" },
  { id: "notifikasi", label: "Notifikasi" },
];

const MODUL_UPT = [
  { kode: "UPT-ADM", label: "Administrasi UPTD", icon: "Arsip", path: "/modul/UPT-ADM" },
  { kode: "UPT-AST", label: "Aset UPTD", icon: "Aset", path: "/modul/UPT-AST" },
  { kode: "UPT-INS", label: "Inspeksi & Pengawasan", icon: "Inspeksi", path: "/modul/UPT-INS" },
  { kode: "UPT-KEP", label: "Kepegawaian UPTD", icon: "Pegawai", path: "/modul/UPT-KEP" },
  { kode: "UPT-KEU", label: "Keuangan UPTD", icon: "Anggaran", path: "/modul/UPT-KEU" },
  { kode: "UPT-MTU", label: "Mutu Pangan", icon: "Mutu", path: "/modul/UPT-MTU" },
  { kode: "UPT-TKN", label: "Teknis Operasional", icon: "Teknis", path: "/modul/UPT-TKN" },
];

function getUser() {
  try {
    const s =
      sessionStorage.getItem("auth-store") ||
      localStorage.getItem("auth-store");
    if (s) {
      const p = JSON.parse(s);
      return p?.state?.user || null;
    }
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID");
  } catch {
    return "-";
  }
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return "";
  }
}

function isTaskDone(status) {
  return ["closed", "verified", "done", "selesai", "submitted"].includes(
    String(status || "").toLowerCase(),
  );
}

function isOverdueTask(task) {
  if (!task?.due_date && !task?.deadline) return false;
  const due = task.due_date || task.deadline;
  return new Date(due) < new Date() && !isTaskDone(task.status);
}

function Badge({ text }) {
  const map = {
    open: { bg: "#E3F2FD", fg: "#1565C0" },
    todo: { bg: "#E3F2FD", fg: "#1565C0" },
    assigned: { bg: "#E3F2FD", fg: "#1565C0" },
    accepted: { bg: "#E8EAF6", fg: "#3949AB" },
    in_progress: { bg: "#FFF9C4", fg: "#F57F17" },
    proses: { bg: "#FFF9C4", fg: "#F57F17" },
    submitted: { bg: "#E8F5E9", fg: "#1B5E20" },
    verified: { bg: "#E8F5E9", fg: "#2E7D32" },
    closed: { bg: "#E8F5E9", fg: "#2E7D32" },
    done: { bg: "#E8F5E9", fg: "#2E7D32" },
    rejected: { bg: "#FFEBEE", fg: "#C62828" },
    overdue: { bg: "#FFEBEE", fg: "#C62828" },
  };
  const s = map[String(text || "").toLowerCase()] || {
    bg: "#ECEFF1",
    fg: "#546E7A",
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {text ? String(text).replace(/_/g, " ") : "-"}
    </span>
  );
}

function KpiCard({ label, value, sub, color, unit }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "14px 18px",
        minWidth: 0,
        width: "100%",
        flex: "1 1 0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: color || T.primary,
          }}
        >
          {value ?? "-"}
        </span>
        {unit && <span style={{ fontSize: 12, color: T.textSec }}>{unit}</span>}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: T.textSec, marginTop: 1 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 4,
          height: 18,
          background: T.primary,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>
          {title}
        </div>
        {sub && <div style={{ fontSize: 11, color: T.textSec }}>{sub}</div>}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  detailTask,
  setDetailTask,
  handleMulai,
  handleSelesai,
  actionLoading,
}) {
  const due = task.due_date || task.deadline;
  const overdue = isOverdueTask(task);
  const status = String(task.status || "").toLowerCase();
  const canStart = ["todo", "open", "assigned", "accepted"].includes(status);
  const canSubmit = ["in_progress", "proses"].includes(status);
  const title = task.title || task.judul || "-";
  const desc = task.description || task.deskripsi || "";

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${overdue ? T.danger : T.border}`,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderLeft: `3px solid ${
          overdue
            ? T.danger
            : canSubmit
              ? T.accent
              : canStart
                ? T.primary
                : T.success
        }`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: T.textPri, fontSize: 13 }}>
            {title}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Badge text={status} />
            {due && (
              <span
                style={{
                  fontSize: 11,
                  color: overdue ? T.danger : T.textSec,
                }}
              >
                {overdue ? "Deadline terlewati: " : "Deadline: "}
                {formatDate(due)}
              </span>
            )}
          </div>
        </div>
        <Badge text={status} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canStart && (
          <button
            onClick={() => handleMulai(task.id)}
            disabled={actionLoading}
            style={{
              background: T.info,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Mulai
          </button>
        )}
        {canSubmit && (
          <button
            onClick={() => handleSelesai(task.id)}
            disabled={actionLoading}
            style={{
              background: T.success,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Submit Hasil
          </button>
        )}
        <button
          onClick={() =>
            setDetailTask(detailTask === task.id ? null : task.id)
          }
          style={{
            background: "transparent",
            color: T.primary,
            border: `1px solid ${T.primary}`,
            borderRadius: 6,
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          {detailTask === task.id ? "Tutup" : "Detail"}
        </button>
      </div>

      {detailTask === task.id && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: T.textSec,
            borderTop: `1px solid ${T.border}`,
            paddingTop: 10,
          }}
        >
          {desc || "Tidak ada deskripsi tambahan."}
        </div>
      )}
    </div>
  );
}

export default function PelaksanaUPTDDashboard() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser || getUser();
  const roleName = String(user?.roleName || user?.role || "").toLowerCase();
  const allowed = ALLOWED.includes(roleName);

  const [tab, setTab] = useState("ringkasan");
  const [summary, setSummary] = useState(null);
  const [absensiHariIni, setAbsensiHariIni] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [detailTask, setDetailTask] = useState(null);
  const [filterTask, setFilterTask] = useState("semua");
  const [flash, setFlash] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showFlash = useCallback((msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  }, []);

  const loadSummary = useCallback(() => {
    if (!allowed) return;
    api
      .get("/pelaksana/dashboard/summary")
      .then((r) => {
        const d = r.data?.data || null;
        setSummary(d);
        setAbsensiHariIni(d?.absensiHariIni || null);
      })
      .catch(() => {
        setSummary(null);
        setAbsensiHariIni(null);
      });
  }, [allowed]);

  const loadTasks = useCallback(() => {
    if (!allowed) return;
    setTasksLoading(true);
    api
      .get("/tasks?unit=uptd&limit=30")
      .then((r) =>
        setTasks(Array.isArray(r.data?.data) ? r.data.data : []),
      )
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [allowed]);

  const loadNotifications = useCallback(() => {
    if (!allowed) return;
    setNotifLoading(true);
    api
      .get("/notifications?limit=20")
      .then((r) =>
        setNotifList(Array.isArray(r.data?.data) ? r.data.data : []),
      )
      .catch(() => setNotifList([]))
      .finally(() => setNotifLoading(false));
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    loadSummary();
    loadTasks();
    loadNotifications();
  }, [allowed, loadSummary, loadTasks, loadNotifications]);

  if (!allowed) return <Navigate to="/" replace />;

  const isPhone = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const isCompact = viewportWidth < 960;
  const pagePaddingX = isPhone ? 12 : isTablet ? 16 : 24;
  const pagePaddingY = isPhone ? 16 : 20;
  const contentMaxWidth =
    viewportWidth >= 1600 ? 1680 : viewportWidth >= 1280 ? 1440 : "100%";
  const summaryGridColumns = isCompact ? "1fr" : "1fr 1fr";
  const taskBoardColumns =
    viewportWidth < 768
      ? "1fr"
      : viewportWidth < 1280
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";
  const kpiGridColumns =
    viewportWidth < 640
      ? "1fr"
      : viewportWidth < 1100
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(4, minmax(0, 1fr))";

  const tasksTodo = tasks.filter((t) =>
    ["todo", "open", "assigned", "accepted"].includes(
      String(t.status || "").toLowerCase(),
    ),
  );
  const tasksProses = tasks.filter((t) =>
    ["in_progress", "proses"].includes(String(t.status || "").toLowerCase()),
  );
  const tasksReturned = tasks.filter((t) =>
    ["returned", "dikembalikan", "rejected"].includes(
      String(t.status || "").toLowerCase(),
    ),
  );
  const activeTasks = tasks.filter((t) => !isTaskDone(t.status));
  const overdueTasks = tasks.filter((t) => isOverdueTask(t));
  const completedTasks = tasks.filter((t) => isTaskDone(t.status));
  const unreadNotif = notifList.filter((n) => !n.read_at).length;
  const dueTodayTasks = tasks.filter((t) => {
    const due = t.due_date || t.deadline;
    if (!due || isTaskDone(t.status)) return false;
    return new Date(due).toDateString() === new Date().toDateString();
  });
  const priorityTasks = tasks.filter((t) => {
    const p = String(t.prioritas || "").toLowerCase();
    return !isTaskDone(t.status) && (p === "tinggi" || isOverdueTask(t));
  });
  const itemsNeedAction = [
    ...tasksReturned.map((t) => ({ ...t, _jenis: "tugas" })),
    ...overdueTasks
      .filter((t) => !tasksReturned.some((r) => r.id === t.id))
      .map((t) => ({ ...t, _jenis: "deadline" })),
  ];

  const filteredTasks =
    filterTask === "semua"
      ? tasks
      : filterTask === "overdue"
        ? overdueTasks
        : filterTask === "selesai"
          ? completedTasks
        : tasks.filter(
            (t) => String(t.status || "").toLowerCase() === filterTask,
          );

  const topTasks = [...activeTasks]
    .sort((a, b) => {
      const aDue = a.due_date || a.deadline || "";
      const bDue = b.due_date || b.deadline || "";
      return String(aDue).localeCompare(String(bDue));
    })
    .slice(0, 4);

  async function handleMulai(id) {
    setActionLoading(true);
    try {
      await api.put(`/tasks/${id}/mulai`);
      showFlash("Tugas berhasil dimulai.");
      loadTasks();
    } catch {
      showFlash("Gagal memulai tugas.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSelesai(id) {
    setActionLoading(true);
    try {
      await api.put(`/tasks/${id}/selesai`);
      showFlash("Tugas berhasil disubmit.");
      loadTasks();
      setDetailTask(null);
    } catch {
      showFlash("Gagal mengirim hasil tugas.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: -9999,
          top: 8,
          background: T.primary,
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 4,
          zIndex: 9999,
          fontSize: 13,
        }}
        onFocus={(e) => {
          e.target.style.left = "8px";
        }}
        onBlur={(e) => {
          e.target.style.left = "-9999px";
        }}
      >
        Lewati ke konten utama
      </a>

      <header
        role="banner"
        style={{
          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.secondary} 100%)`,
          color: "#fff",
          padding: isPhone ? "14px 12px" : "14px 24px",
          display: "flex",
          flexDirection: isPhone ? "column" : "row",
          alignItems: isPhone ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: isPhone ? 15 : 17, fontWeight: 700 }}>
            Dashboard Pelaksana - UPTD Balai Pengawasan
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {user?.name || user?.nama_lengkap || user?.username || "-"} ·{" "}
            {user?.unit_kerja || "UPTD Balai Pengawasan"}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, textAlign: isPhone ? "left" : "right" }}>
          {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </div>
      </header>

      {flash && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            top: isPhone ? 12 : 16,
            right: isPhone ? 12 : 16,
            left: isPhone ? 12 : "auto",
            zIndex: 9999,
            background:
              flash.type === "error"
                ? T.danger
                : flash.type === "warning"
                  ? T.warning
                  : T.accent,
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
            fontSize: 13,
            maxWidth: isPhone ? "calc(100vw - 24px)" : 340,
          }}
        >
          {flash.msg}
        </div>
      )}

      <nav
        style={{
          background: T.card,
          borderBottom: `2px solid ${T.border}`,
          padding: isPhone ? "0 12px" : "0 24px",
          display: "flex",
          gap: 2,
          overflowX: "auto",
        }}
      >
        {TABS.map((item) => {
          const badge =
            item.id === "tugas"
              ? activeTasks.length || null
              : item.id === "notifikasi"
                ? unreadNotif || null
                : null;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                padding: "11px 16px",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === item.id ? 700 : 400,
                color: tab === item.id ? T.primary : T.textSec,
                borderBottom:
                  tab === item.id
                    ? `3px solid ${T.primary}`
                    : "3px solid transparent",
                background: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
              {badge ? (
                <span
                  style={{
                    marginLeft: 5,
                    background: T.danger,
                    color: "#fff",
                    borderRadius: 10,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <main
        id="main-content"
        style={{
          width: "100%",
          padding: `${pagePaddingY}px ${pagePaddingX}px 32px`,
          maxWidth: contentMaxWidth,
          margin: "0 auto",
        }}
      >
        {tab === "ringkasan" && (
          <div>
            <h2
              style={{
                color: T.primary,
                fontSize: isPhone ? 16 : 18,
                marginBottom: 14,
              }}
            >
              Selamat datang,{" "}
              {user?.nama_lengkap?.split(" ")[0] ||
                user?.name?.split(" ")[0] ||
                user?.username?.split(" ")[0] ||
                "Rekan"}
              !
            </h2>

            <div
              style={{
                background: absensiHariIni?.status ? "#E8F5E9" : "#FFF3E0",
                border: `1px solid ${absensiHariIni?.status ? T.success : T.accent}`,
                borderRadius: 10,
                padding: isPhone ? "12px 14px" : "12px 18px",
                marginBottom: 16,
                display: "flex",
                flexDirection: isPhone ? "column" : "row",
                alignItems: isPhone ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: absensiHariIni?.status ? T.success : T.accent,
                  }}
                >
                  {absensiHariIni?.status
                    ? `Sudah absen hari ini: ${String(absensiHariIni.status).toUpperCase()} (${absensiHariIni.jam || "-"})`
                    : "Status absensi hari ini belum tersinkron"}
                </span>
                <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div style={{ fontSize: 11, color: T.textSec }}>
                {user?.unit_kerja || "UPTD Balai Pengawasan"}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: kpiGridColumns,
                gap: 12,
                marginBottom: 20,
              }}
            >
              <KpiCard
                label="Tugas Aktif"
                value={summary?.tugasAktif ?? (tasksTodo.length + tasksProses.length)}
                unit="tugas"
                color={T.warning}
                sub="assigned + in progress"
              />
              <KpiCard
                label="Tugas Overdue"
                value={summary?.tugasOverdue ?? overdueTasks.length}
                unit="tugas"
                color={overdueTasks.length > 0 ? T.danger : T.success}
                sub="melewati deadline"
              />
              <KpiCard
                label="Modul Aktif"
                value={MODUL_UPT.length}
                unit="modul"
                color={T.accent}
                sub="akses kerja UPTD"
              />
              <KpiCard
                label="Notifikasi Baru"
                value={unreadNotif}
                unit="item"
                color={T.info}
                sub="belum dibaca"
              />
            </div>

            {priorityTasks.length > 0 && (
              <div
                style={{
                  background: "#FFF3E0",
                  border: `1px solid ${T.warning}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: T.warning,
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  Prioritas Tinggi
                </div>
                {priorityTasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      flexDirection: isPhone ? "column" : "row",
                      justifyContent: "space-between",
                      alignItems: isPhone ? "flex-start" : "center",
                      marginBottom: 6,
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, color: T.textPri }}>
                      {t.title || t.judul || "-"}
                    </span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: isOverdueTask(t) ? T.danger : T.textSec,
                        }}
                      >
                        {formatDate(t.due_date || t.deadline)}
                      </span>
                      <Badge text={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {unreadNotif > 0 && (
              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: T.primary,
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  Notifikasi Belum Dibaca
                </div>
                {notifList
                  .filter((n) => !n.read_at)
                  .slice(0, 3)
                  .map((n, idx) => (
                    <div
                      key={n.id ?? idx}
                      style={{
                        display: "flex",
                        flexDirection: isPhone ? "column" : "row",
                        justifyContent: "space-between",
                        marginBottom: 5,
                        fontSize: 12,
                        gap: 10,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{n.message || "-"}</span>
                      <span style={{ color: T.textSec }}>
                        {formatDateTime(n.created_at)}
                      </span>
                    </div>
                  ))}
                <button
                  onClick={() => setTab("notifikasi")}
                  style={{
                    marginTop: 8,
                    background: "transparent",
                    color: T.primary,
                    border: `1px solid ${T.primary}`,
                    borderRadius: 6,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  Lihat semua notifikasi
                </button>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: summaryGridColumns,
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <SectionTitle title="Tugas UPTD" sub="Status terkini" />
                {topTasks.length === 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSec,
                      fontStyle: "italic",
                    }}
                  >
                    Belum ada tugas aktif.
                  </div>
                )}
                {topTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      borderBottom: `1px solid ${T.border}`,
                      paddingBottom: 10,
                      marginBottom: 10,
                      borderLeft: `3px solid ${isOverdueTask(task) ? T.danger : T.primary}`,
                      paddingLeft: 8,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 12,
                        color: T.textPri,
                      }}
                    >
                      {task.title || task.judul || "-"}
                    </div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                      Deadline: {formatDate(task.due_date || task.deadline)}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Badge text={task.status} />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setTab("tugas")}
                  style={{
                    marginTop: 4,
                    background: "transparent",
                    color: T.primary,
                    border: `1px solid ${T.primary}`,
                    borderRadius: 6,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontSize: 11,
                    width: "100%",
                  }}
                >
                  Lihat semua tugas
                </button>
              </div>

              <div
                style={{
                  background: itemsNeedAction.length > 0 ? "#FFF8F8" : T.card,
                  border: `1px solid ${itemsNeedAction.length > 0 ? "#FFCDD2" : T.border}`,
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 4,
                      height: 18,
                      background: itemsNeedAction.length > 0 ? T.danger : T.border,
                      borderRadius: 2,
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: T.textPri, fontSize: 14 }}>
                      Perlu Tindakan
                    </span>
                    {itemsNeedAction.length > 0 && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: T.danger,
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 7px",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {itemsNeedAction.length}
                      </span>
                    )}
                  </div>
                </div>
                {itemsNeedAction.length === 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: T.success,
                      fontStyle: "italic",
                    }}
                  >
                    Tidak ada item yang perlu ditindaklanjuti.
                  </div>
                )}
                {itemsNeedAction.map((item) => (
                  <div
                    key={`${item._jenis}-${item.id}`}
                    style={{
                      background: "#FFEBEE",
                      border: `1px solid #FFCDD2`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 10,
                          background: T.danger,
                          color: "#fff",
                          borderRadius: 3,
                          padding: "1px 6px",
                          fontWeight: 700,
                        }}
                      >
                        {item._jenis === "deadline" ? "DEADLINE" : "TUGAS"}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 12, color: T.textPri }}>
                        {item.title || item.judul || "-"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: T.danger, marginBottom: 6 }}>
                      {item._jenis === "deadline"
                        ? `Melewati deadline ${formatDate(item.due_date || item.deadline)}`
                        : "Perlu diperbaiki atau ditinjau ulang"}
                    </div>
                    <button
                      onClick={() => setTab("tugas")}
                      style={{
                        width: "100%",
                        background: T.danger,
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        padding: "5px 0",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      Buka Daftar Tugas
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: summaryGridColumns,
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <SectionTitle
                  title="Status Pelaksana UPTD"
                  sub="Data pribadi - hanya Anda yang bisa melihat"
                />
                <div style={{ fontSize: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(92px, auto) 1fr",
                      gap: "4px 12px",
                      color: T.textPri,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: T.textSec }}>NIP</span>
                    <span style={{ fontFamily: "monospace" }}>{user?.nip || "-"}</span>
                    <span style={{ color: T.textSec }}>Jabatan</span>
                    <span style={{ fontWeight: 600 }}>
                      {user?.jabatan || "Pelaksana UPTD"}
                    </span>
                    <span style={{ color: T.textSec }}>Unit</span>
                    <span>{user?.unit_kerja || "UPTD Balai Pengawasan"}</span>
                    <span style={{ color: T.textSec }}>Tugas selesai</span>
                    <span>{completedTasks.length} tugas</span>
                  </div>

                  <div
                    style={{
                      background: "#E3F2FD",
                      border: "1px solid #90CAF9",
                      borderRadius: 8,
                      padding: "8px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 11,
                        color: T.info,
                        marginBottom: 2,
                      }}
                    >
                      Capaian Tugas
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>
                      {completedTasks.length}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: T.textSec,
                          marginLeft: 6,
                        }}
                      >
                        tugas selesai
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <SectionTitle title="Jadwal & Pengingat" sub="Hari ini dan mendatang" />
                {overdueTasks.length > 0 && (
                  <div
                    style={{
                      background: "#FFEBEE",
                      border: `1px solid #FFCDD2`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, marginBottom: 4 }}>
                      {overdueTasks.length} tugas melewati deadline
                    </div>
                    {overdueTasks.slice(0, 2).map((t) => (
                      <div key={t.id} style={{ fontSize: 11, color: T.danger }}>
                        - {t.title || t.judul || "-"}
                      </div>
                    ))}
                  </div>
                )}

                {dueTodayTasks.length > 0 && (
                  <div
                    style={{
                      background: "#FFF3E0",
                      border: `1px solid #FFE0B2`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 4 }}>
                      Deadline Hari Ini
                    </div>
                    {dueTodayTasks.map((t) => (
                      <div key={t.id} style={{ fontSize: 11, color: T.textPri }}>
                        - {t.title || t.judul || "-"}
                      </div>
                    ))}
                  </div>
                )}

                {unreadNotif > 0 && (
                  <div
                    style={{
                      background: "#E8F5E9",
                      border: `1px solid #A5D6A7`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, color: T.success }}>
                      {unreadNotif} notifikasi baru menunggu dibaca
                    </div>
                  </div>
                )}

                {overdueTasks.length === 0 &&
                  dueTodayTasks.length === 0 &&
                  unreadNotif === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: T.success,
                        fontStyle: "italic",
                      }}
                    >
                      Semua jadwal lancar.
                    </div>
                  )}
              </div>
            </div>

            <SectionTitle title="Akses Cepat Modul" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${isPhone ? 120 : 140}px, 1fr))`,
                gap: 10,
              }}
            >
              {MODUL_UPT.slice(0, 6).map((m) => (
                <Link
                  key={m.kode}
                  to={m.path}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    textDecoration: "none",
                    color: T.primary,
                    fontWeight: 600,
                    fontSize: 12,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      background: "#EEF4FB",
                      color: T.primary,
                      borderRadius: 999,
                      padding: "8px 12px",
                    }}
                  >
                    {m.icon}
                  </span>
                  <span>{m.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "tugas" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <SectionTitle
                title="Tugas Saya"
                sub={`${tasks.length} total · ${itemsNeedAction.length} perlu tindakan · ${overdueTasks.length} overdue`}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  ["semua", "Semua"],
                  ["selesai", "Selesai"],
                  ["overdue", "Overdue"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilterTask(value)}
                    style={{
                      padding: "4px 10px",
                      fontSize: 11,
                      borderRadius: 6,
                      border: `1px solid ${filterTask === value ? T.primary : T.border}`,
                      background: filterTask === value ? T.primary : T.card,
                      color: filterTask === value ? "#fff" : T.textSec,
                      cursor: "pointer",
                      fontWeight: filterTask === value ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tasksLoading ? (
              <div
                style={{
                  color: T.textSec,
                  fontStyle: "italic",
                  padding: 20,
                  textAlign: "center",
                }}
              >
                Memuat tugas...
              </div>
            ) : filterTask !== "semua" ? (
              filteredTasks.length === 0 ? (
                <div
                  style={{
                    color: T.textSec,
                    fontStyle: "italic",
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  Tidak ada tugas.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    detailTask={detailTask}
                    setDetailTask={setDetailTask}
                    handleMulai={handleMulai}
                    handleSelesai={handleSelesai}
                    actionLoading={actionLoading}
                  />
                ))
              )
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: taskBoardColumns,
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    background: "#F8FAFC",
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.info,
                      fontSize: 12,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Belum Mulai ({tasksTodo.length})
                  </div>
                  {tasksTodo.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textSec,
                        fontStyle: "italic",
                      }}
                    >
                      Tidak ada
                    </div>
                  )}
                  {tasksTodo.map((task) => {
                    const due = task.due_date || task.deadline;
                    const overdue = isOverdueTask(task);
                    const title = task.title || task.judul || "-";
                    const priority = task.prioritas || task.priority;
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: T.card,
                          border: `1px solid ${overdue ? T.danger : T.border}`,
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 8,
                          borderLeft: `3px solid ${overdue ? T.danger : T.info}`,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 12,
                            color: T.textPri,
                            marginBottom: 4,
                          }}
                        >
                          {title}
                        </div>
                        {due && (
                          <div
                            style={{
                              fontSize: 10,
                              color: overdue ? T.danger : T.textSec,
                              marginBottom: 6,
                            }}
                          >
                            {overdue ? "Terlambat: " : "Deadline: "}
                            {formatDate(due)}
                          </div>
                        )}
                        {priority && (
                          <div
                            style={{
                              fontSize: 10,
                              color: priority === "tinggi" ? T.danger : T.accent,
                              fontWeight: 600,
                              marginBottom: 6,
                            }}
                          >
                            Prioritas: {priority}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleMulai(task.id)}
                            disabled={actionLoading}
                            style={{
                              flex: 1,
                              background: T.info,
                              color: "#fff",
                              border: "none",
                              borderRadius: 5,
                              padding: "5px 0",
                              cursor: "pointer",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Mulai
                          </button>
                          <button
                            onClick={() =>
                              setDetailTask(detailTask === task.id ? null : task.id)
                            }
                            style={{
                              background: "transparent",
                              color: T.textSec,
                              border: `1px solid ${T.border}`,
                              borderRadius: 5,
                              padding: "5px 8px",
                              cursor: "pointer",
                              fontSize: 10,
                            }}
                          >
                            Detail
                          </button>
                        </div>
                        {detailTask === task.id && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: T.textSec,
                              borderTop: `1px solid ${T.border}`,
                              paddingTop: 8,
                            }}
                          >
                            {task.description ||
                              task.deskripsi ||
                              "Tidak ada deskripsi."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    background: "#FFFDE7",
                    border: "1px solid #FFE082",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.accent,
                      fontSize: 12,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Sedang Berjalan ({tasksProses.length})
                  </div>
                  {tasksProses.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textSec,
                        fontStyle: "italic",
                      }}
                    >
                      Tidak ada
                    </div>
                  )}
                  {tasksProses.map((task) => {
                    const due = task.due_date || task.deadline;
                    const overdue = isOverdueTask(task);
                    const title = task.title || task.judul || "-";
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: T.card,
                          border: `1px solid ${overdue ? T.danger : "#FFE082"}`,
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 8,
                          borderLeft: `3px solid ${T.accent}`,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 12,
                            color: T.textPri,
                            marginBottom: 4,
                          }}
                        >
                          {title}
                        </div>
                        {task.started_at && (
                          <div
                            style={{
                              fontSize: 10,
                              color: T.textSec,
                              marginBottom: 4,
                            }}
                          >
                            Mulai: {formatDateTime(task.started_at)}
                          </div>
                        )}
                        {due && (
                          <div
                            style={{
                              fontSize: 10,
                              color: overdue ? T.danger : T.textSec,
                              marginBottom: 6,
                            }}
                          >
                            {overdue ? "Terlambat: " : "Deadline: "}
                            {formatDate(due)}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleSelesai(task.id)}
                            disabled={actionLoading}
                            style={{
                              flex: 1,
                              background: T.success,
                              color: "#fff",
                              border: "none",
                              borderRadius: 5,
                              padding: "5px 0",
                              cursor: "pointer",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Submit Hasil
                          </button>
                          <button
                            onClick={() =>
                              setDetailTask(detailTask === task.id ? null : task.id)
                            }
                            style={{
                              background: "transparent",
                              color: T.textSec,
                              border: `1px solid ${T.border}`,
                              borderRadius: 5,
                              padding: "5px 8px",
                              cursor: "pointer",
                              fontSize: 10,
                            }}
                          >
                            Detail
                          </button>
                        </div>
                        {detailTask === task.id && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: T.textSec,
                              borderTop: `1px solid ${T.border}`,
                              paddingTop: 8,
                            }}
                          >
                            {task.description ||
                              task.deskripsi ||
                              "Tidak ada deskripsi."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    background: "#FFF8F8",
                    border: "1px solid #FFCDD2",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: T.danger,
                      fontSize: 12,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Perlu Tindakan ({itemsNeedAction.length})
                  </div>
                  {itemsNeedAction.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textSec,
                        fontStyle: "italic",
                      }}
                    >
                      Tidak ada
                    </div>
                  )}
                  {itemsNeedAction.map((task) => {
                    const due = task.due_date || task.deadline;
                    const title = task.title || task.judul || "-";
                    const note = task.catatan_kembalikan || task.returned_note;
                    const isDeadline = task._jenis === "deadline";
                    return (
                      <div
                        key={`${task._jenis}-${task.id}`}
                        style={{
                          background: T.card,
                          border: "1px solid #FFCDD2",
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 8,
                          borderLeft: `3px solid ${T.danger}`,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 12,
                            color: T.textPri,
                            marginBottom: 4,
                          }}
                        >
                          {title}
                        </div>
                        {note ? (
                          <div
                            style={{
                              fontSize: 10,
                              background: "#FFEBEE",
                              color: T.danger,
                              borderRadius: 4,
                              padding: "4px 8px",
                              marginBottom: 6,
                            }}
                          >
                            <strong>Catatan:</strong> {note}
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: 10,
                              color: T.danger,
                              marginBottom: 6,
                            }}
                          >
                            {isDeadline
                              ? `Melewati deadline ${formatDate(due)}`
                              : "Perlu diperbaiki atau ditinjau ulang"}
                          </div>
                        )}
                        <button
                          onClick={() =>
                            setDetailTask(detailTask === task.id ? null : task.id)
                          }
                          style={{
                            width: "100%",
                            background: T.danger,
                            color: "#fff",
                            border: "none",
                            borderRadius: 5,
                            padding: "5px 0",
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {isDeadline ? "Lihat Detail" : "Perbaiki Tugas"}
                        </button>
                        {detailTask === task.id && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: T.textSec,
                              borderTop: `1px solid ${T.border}`,
                              paddingTop: 8,
                            }}
                          >
                            {task.description ||
                              task.deskripsi ||
                              "Tidak ada deskripsi tambahan."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: 14,
                padding: "8px 14px",
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                fontSize: 11,
                color: T.textSec,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <span>{tasksTodo.length} belum mulai</span>
              <span>{tasksProses.length} sedang berjalan</span>
              <span>{itemsNeedAction.length} perlu tindakan</span>
              <span>{completedTasks.length} selesai</span>
              <span
                style={{
                  color: overdueTasks.length > 0 ? T.danger : T.success,
                  fontWeight: 600,
                }}
              >
                {overdueTasks.length} overdue
              </span>
            </div>
          </div>
        )}

        {tab === "modul" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>
              Modul Kerja UPTD Balai Pengawasan
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${isPhone ? 130 : 160}px, 1fr))`,
                gap: 12,
              }}
            >
              {MODUL_UPT.map((m) => (
                <Link
                  key={m.kode}
                  to={m.path}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    padding: "16px 14px",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    transition: "box-shadow .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(27,79,138,.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      background: "#EEF4FB",
                      color: T.primary,
                      borderRadius: 999,
                      padding: "8px 14px",
                      fontWeight: 700,
                    }}
                  >
                    {m.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: T.primary,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    {m.label}
                  </span>
                  <span style={{ fontSize: 10, color: T.textSec }}>{m.kode}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "notifikasi" && (
          <div>
            <h2 style={{ color: T.primary, fontSize: 15, marginBottom: 14 }}>
              Notifikasi
            </h2>
            {notifLoading ? (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Memuat notifikasi...
              </div>
            ) : notifList.length === 0 ? (
              <div style={{ color: T.textSec, fontStyle: "italic", padding: 20, textAlign: "center" }}>
                Tidak ada notifikasi.
              </div>
            ) : (
              notifList.map((n, idx) => {
                const notifType = String(n.type || n.tipe || "").toLowerCase();
                const isRead = Boolean(n.read_at || n.dibaca);
                const icon =
                  notifType === "warning"
                    ? "!"
                    : notifType === "success"
                      ? "OK"
                      : notifType === "error"
                        ? "X"
                        : "i";
                const color =
                  notifType === "warning"
                    ? T.warning
                    : notifType === "success"
                      ? T.success
                      : notifType === "error"
                        ? T.danger
                        : T.primary;
                return (
                  <div
                    key={n.id ?? idx}
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      padding: "14px 18px",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      opacity: isRead ? 0.7 : 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        color,
                        flexShrink: 0,
                        marginTop: 1,
                        fontWeight: 700,
                      }}
                    >
                      {icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.textPri,
                          fontWeight: isRead ? 400 : 600,
                        }}
                      >
                        {n.message || n.pesan || "-"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.textSec,
                          marginTop: 3,
                        }}
                      >
                        {n.waktu || formatDateTime(n.created_at) || "-"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <footer
        role="contentinfo"
        style={{
          textAlign: "center",
          fontSize: 11,
          color: T.textSec,
          padding: "12px 0",
          borderTop: `1px solid ${T.border}`,
          marginTop: 24,
        }}
      >
        SIGAP-MALUT © 2026 · Pelaksana UPTD Balai Pengawasan · Dinas Pangan
      </footer>
    </div>
  );
}
