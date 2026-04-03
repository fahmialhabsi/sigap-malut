import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChartBarSquareIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../stores/authStore";
import { normalizeRoleKey } from "../../utils/normalizeRole";
import api from "../../services/api";
import superAdminModules from "../../data/superAdminModules";
import MasterDataSyncPanel from "../../components/MasterDataSyncPanel.jsx";
import IntegrationLogPanel from "../../components/IntegrationLogPanel.jsx";

/** KPI tile — dokumen 05: KpiTile + tooltip definisi */
function KpiTile({ label, value, hint, title: a11yTitle }) {
  return (
    <div
      className="rounded-xl border border-exec-border bg-card p-4 shadow-soft-sm"
      title={a11yTitle || hint}
    >
      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-ink tabular-nums mt-1">{value}</div>
      {hint ? (
        <div className="text-[11px] text-muted mt-1 leading-snug">{hint}</div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-exec-border bg-card shadow-soft-sm overflow-hidden ${className}`}
    >
      <div className="px-4 py-3 border-b border-muted/40 bg-bg/80">
        <h2 className="text-h3 text-ink">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const MODULE_PATH = {
  SA01: "/module/sa01",
  SA02: "/module/sa02",
  SA03: "/module/sa03",
  SA04: "/module/sa04",
  SA05: "/user-management",
};

const MODULE_ICONS = {
  SA01: ChartBarSquareIcon,
  SA02: WrenchScrewdriverIcon,
  SA03: DocumentTextIcon,
  SA04: ClipboardDocumentListIcon,
  SA05: UserGroupIcon,
};

export default function DashboardSuperAdmin() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const roleName = normalizeRoleKey(user);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );
  const [clock, setClock] = useState(() => new Date());
  const [userRow, setUserRow] = useState(null);
  const [auditRows, setAuditRows] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [adminSummary, setAdminSummary] = useState(null);
  const [apiHealth, setApiHealth] = useState("checking");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  if (!user || roleName !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  const menuItems = useMemo(
    () => [
      { to: "/dashboard/superadmin", label: "Beranda Admin", end: true },
      { to: "/user-management", label: "Manajemen pengguna & peran" },
      { to: "/audit-trail", label: "Audit trail & kepatuhan" },
      { to: "/module-wizard", label: "Generator modul" },
      { to: "/analytics", label: "Analitik mandiri" },
      { to: "/dashboard/inflasi/mendagri", label: "Laporan Mendagri" },
    ],
    [],
  );

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    if (avatarOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [avatarOpen]);

  const loadDashboardData = useCallback(async () => {
    setAuditLoading(true);
    try {
      const [meRes, auditRes, adminRes] = await Promise.allSettled([
        api.get("/auth/me"),
        api.get("/auditlogcontroller", { params: { limit: 12, page: 1 } }),
        api.get("/dashboard/super-admin/summary"),
      ]);

      if (meRes.status === "fulfilled") {
        const d = meRes.value.data?.data || meRes.value.data?.user || meRes.value.data;
        setUserRow(d);
      }

      if (auditRes.status === "fulfilled") {
        const body = auditRes.value.data;
        setAuditRows(Array.isArray(body?.data) ? body.data : []);
      } else {
        setAuditRows([]);
      }

      if (adminRes.status === "fulfilled") {
        setAdminSummary(adminRes.value.data?.data || null);
      } else {
        setAdminSummary(null);
        const err = adminRes.status === "rejected" ? adminRes.reason : null;
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 403
            ? "Akses ditolak — hanya super_admin"
            : "Gagal memuat ringkasan Super Admin");
        toast.error(msg);
      }
    } catch {
      toast.error("Sebagian data dashboard gagal dimuat");
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${window.location.origin}/health`)
      .then((r) => {
        if (!cancelled) setApiHealth(r.ok ? "online" : "degraded");
      })
      .catch(() => {
        if (!cancelled) setApiHealth("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatClock = () => {
    try {
      return clock.toLocaleString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return String(clock);
    }
  };

  const completionPct =
    adminSummary?.tasks?.completionRate30dPct != null
      ? `${adminSummary.tasks.completionRate30dPct}%`
      : "—";

  const overdue =
    adminSummary?.tasks?.overdue != null ? adminSummary.tasks.overdue : null;

  const userTotal = adminSummary?.users?.total;
  const auditEntriesTotal = adminSummary?.auditLog?.entriesTotal;
  const compliancePct = adminSummary?.compliance?.complianceAlurKoordinasiPct;

  const displayName =
    userRow?.nama_lengkap ||
    user?.nama_lengkap ||
    userRow?.name ||
    user?.username ||
    "Super Admin";

  const initials = String(displayName)
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] w-full min-w-0 flex bg-bg text-ink font-sans antialiased">
      {isMobile && sidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-muted bg-ink text-surface transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-[min(100vw-3rem,280px)] shrink-0`}
      >
        <div className="p-4 border-b border-muted/50 flex items-center gap-3">
          <img src="/Logo.png" alt="" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-sm font-bold text-surface">SIGAP Malut</div>
            <div className="text-[11px] text-muted">System Control Center</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Menu super admin">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-surface/90 hover:bg-surface/10"
                }`
              }
            >
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          <a
            href="/dashboard-publik"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-surface/90 hover:bg-surface/10"
          >
            <GlobeAltIcon className="w-5 h-5 shrink-0" />
            Dashboard publik
          </a>
        </nav>
        <div className="p-3 border-t border-muted/50 text-[10px] text-muted leading-relaxed">
          Pedoman: <span className="text-surface/80">dokumenSistem/05, 14, 31</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-muted bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-muted text-ink"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Buka menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-h2 text-ink truncate">Dashboard Super Admin</h1>
              <p className="text-xs text-muted truncate hidden sm:block">
                Administrator sistem — RBAC, audit, master data, integrasi (Permenpan RB / SPBE)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="hidden md:block text-right">
              <div className="text-[11px] text-muted">Waktu server (klien)</div>
              <div className="text-xs font-mono text-ink">{formatClock()}</div>
            </div>
            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                onClick={() => setAvatarOpen((o) => !o)}
                className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-soft-sm"
                aria-expanded={avatarOpen}
                aria-haspopup="true"
              >
                {initials || "SA"}
              </button>
              {avatarOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-muted bg-card shadow-soft py-2 z-50">
                  <div className="px-3 py-2 border-b border-muted/50">
                    <div className="text-sm font-semibold text-ink">{displayName}</div>
                    <div className="text-xs text-muted truncate">
                      {userRow?.email || user?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-bg text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[100vw] box-border px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Status strip — dokumen 14: alert & API health */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-6 lg:col-span-4 flex items-center gap-2 rounded-lg border border-muted bg-card px-3 py-2">
                <ServerStackIcon className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-ink">API &amp; layanan</div>
                  <div className="text-[11px] text-muted">
                    {apiHealth === "online" && "Health endpoint merespons OK"}
                    {apiHealth === "degraded" && "Health merespons non-200"}
                    {apiHealth === "offline" && "Tidak terhubung ke health endpoint"}
                    {apiHealth === "checking" && "Memeriksa…"}
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4 flex items-center gap-2 rounded-lg border border-muted bg-card px-3 py-2">
                <ShieldCheckIcon className="w-5 h-5 text-success shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-ink">Kepatuhan alur (30 hari)</div>
                  <div className="text-[11px] text-muted">
                    {compliancePct != null
                      ? `Skor compliance audit: ${compliancePct}% · Pelanggaran bypass: ${adminSummary?.compliance?.bypassViolations30d ?? "—"}`
                      : "RBAC aktif · Audit log tersedia — muat ringkasan untuk metrik"}
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 flex flex-wrap gap-2 items-center">
                <Link
                  to="/audit-trail"
                  className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
                >
                  Audit trail penuh
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    loadDashboardData();
                    toast.success("Data dashboard dimuat ulang");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-muted px-3 py-2 text-xs font-semibold text-ink hover:bg-bg"
                >
                  Muat ulang KPI
                </button>
              </div>
            </div>

            {/* Executive summary KPI — grid 12 kolom */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <KpiTile
                  label="Pengguna terdaftar"
                  value={userTotal != null ? String(userTotal) : "—"}
                  hint="Sumber: GET /api/dashboard/super-admin/summary (users.total)"
                  a11yTitle="Jumlah akun pengguna di sistem"
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <KpiTile
                  label="Entri audit (total)"
                  value={auditEntriesTotal != null ? String(auditEntriesTotal) : "—"}
                  hint="Sumber: ringkasan Super Admin (auditLog.entriesTotal)"
                  a11yTitle="Total rekaman audit trail di basis data"
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <KpiTile
                  label="Tugas terlambat (lintas unit)"
                  value={overdue != null ? String(overdue) : "—"}
                  hint="Task due_date lewat & status belum closed/rejected"
                  a11yTitle="Jumlah tugas seluruh organisasi yang melewati tenggat"
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <KpiTile
                  label="Penutupan tugas (30 hari)"
                  value={completionPct}
                  hint="closed ÷ dibuat (30 hari) — agregat Tasks"
                  a11yTitle="Persentase tugas ditutup terhadap tugas baru dalam 30 hari"
                />
              </div>
            </div>

            {/* Quick actions — dokumen 05 QuickActionBar */}
            <SectionCard
              title="Aksi cepat"
              subtitle="Tautan operasional sesuai matriks layanan Super Admin (dokumen 14)"
            >
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/user-management"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                >
                  <UserGroupIcon className="w-5 h-5" />
                  Manajemen pengguna
                </Link>
                <Link
                  to="/module-wizard"
                  className="inline-flex items-center gap-2 rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-bg"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-primary" />
                  Generator modul
                </Link>
                <Link
                  to="/dashboard/inflasi/mendagri"
                  className="inline-flex items-center gap-2 rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-bg"
                >
                  <DocumentTextIcon className="w-5 h-5 text-primary" />
                  Laporan Mendagri
                </Link>
                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-2 rounded-lg border border-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-bg"
                >
                  <ChartBarSquareIcon className="w-5 h-5 text-primary" />
                  Analitik mandiri
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    toast("Panel AI / rekomendasi: hubungkan ke layanan backend saat tersedia", {
                      icon: "ℹ️",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted px-4 py-2 text-sm font-medium text-muted"
                >
                  AI inbox (roadmap)
                </button>
              </div>
            </SectionCard>

            <div className="grid grid-cols-12 gap-6">
              {/* Activity feed / audit — dokumen 05 AlertList & ActivityFeed */}
              <div className="col-span-12 xl:col-span-7 space-y-4">
                <SectionCard
                  title="Audit trail — aktivitas terbaru"
                  subtitle="Read-only; ekspor CSV tersedia di endpoint (lihat OpenAPI)"
                >
                  {auditLoading ? (
                    <p className="text-sm text-muted">Memuat log…</p>
                  ) : auditRows.length === 0 ? (
                    <p className="text-sm text-muted">
                      Belum ada entri atau endpoint audit tidak tersedia untuk sesi ini.
                    </p>
                  ) : (
                    <div className="overflow-x-auto -mx-4 px-4">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted border-b border-muted">
                            <th className="py-2 pr-3 font-semibold">Waktu</th>
                            <th className="py-2 pr-3 font-semibold">Modul</th>
                            <th className="py-2 pr-3 font-semibold">Aksi</th>
                            <th className="py-2 pr-3 font-semibold">Entitas</th>
                            <th className="py-2 font-semibold">Pelaku</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditRows.map((row) => (
                            <tr key={row.id} className="border-b border-muted/40">
                              <td className="py-2 pr-3 whitespace-nowrap text-xs font-mono text-muted">
                                {row.created_at
                                  ? new Date(row.created_at).toLocaleString("id-ID")
                                  : "—"}
                              </td>
                              <td className="py-2 pr-3 text-ink">{row.modul || "—"}</td>
                              <td className="py-2 pr-3">
                                <span className="rounded bg-bg px-2 py-0.5 text-xs font-medium">
                                  {row.aksi || "—"}
                                </span>
                              </td>
                              <td className="py-2 pr-3 text-muted truncate max-w-[140px]">
                                {row.entitas_id || "—"}
                              </td>
                              <td className="py-2 text-muted text-xs">{row.pegawai_id || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {auditEntriesTotal != null ? (
                    <p className="text-[11px] text-muted mt-3">
                      Total entri audit di basis data:{" "}
                      <span className="font-semibold text-ink">{auditEntriesTotal}</span>
                      {" "}— tabel di atas menampilkan {auditRows.length} aktivitas terbaru.
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to="/audit-trail"
                      className="text-sm font-semibold text-primary inline-flex items-center gap-1"
                    >
                      Buka halaman audit
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                    <span className="text-xs text-muted self-center">
                      Ekspor CSV audit memakai endpoint terautentikasi (lihat OpenAPI).
                    </span>
                  </div>
                </SectionCard>
              </div>

              <div className="col-span-12 xl:col-span-5 space-y-4">
                <SectionCard
                  title="Modul administrasi sistem"
                  subtitle="Master data & modul khusus Super Admin (CSV master-data)"
                >
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {superAdminModules.map((mod) => {
                      const Icon = MODULE_ICONS[mod.id] || Cog6ToothIcon;
                      const href = MODULE_PATH[mod.id] || `/module/${String(mod.id).toLowerCase()}`;
                      const inner = (
                        <>
                          <div className="flex items-start gap-3">
                            <Icon className="w-8 h-8 text-primary shrink-0" />
                            <div>
                              <div className="font-semibold text-ink text-sm leading-snug">
                                {mod.name}
                              </div>
                              <div className="text-[11px] text-muted font-mono mt-0.5">
                                {mod.id}
                              </div>
                            </div>
                          </div>
                          <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                            Buka
                            <ChevronRightIcon className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </>
                      );
                      return (
                        <li key={mod.id}>
                          <Link
                            to={href}
                            className="flex flex-col rounded-xl border border-muted bg-bg/60 p-4 h-full hover:border-primary/40 hover:bg-card transition-colors"
                          >
                            {inner}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </SectionCard>

                <SectionCard
                  title="Integrasi &amp; master data"
                  subtitle="Sinkronisasi evidence / master-data — dokumen 04 &amp; 28"
                >
                  <div className="space-y-6">
                    <MasterDataSyncPanel />
                    <IntegrationLogPanel />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Catatan implementasi"
                  subtitle="Roadmap vs dokumen 14 (System Control Panel infrastruktur)"
                >
                  <ul className="text-xs text-muted space-y-2 list-disc pl-4">
                    <li>
                      Metrik CPU/memori/disk &amp; status backup basis data memerlukan endpoint
                      monitoring infrastruktur (belum disatukan di MVP ini).
                    </li>
                    <li>
                      MFA, session idle timeout, dan rate limit penuh dicatat sebagai peningkatan
                      keamanan pada dokumen 14 §1.4.
                    </li>
                    <li>
                      Ringkasan KPI memakai{" "}
                      <code className="text-[10px] bg-bg px-1 rounded">
                        GET /api/dashboard/super-admin/summary
                      </code>{" "}
                      (cache ±60 dtk); gunakan &quot;Muat ulang KPI&quot; untuk snapshot manual.
                    </li>
                  </ul>
                </SectionCard>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-muted bg-card px-4 sm:px-6 py-2 text-[11px] text-muted flex flex-wrap justify-between gap-2">
          <span>SIGAP Malut · Dinas Pangan Provinsi Maluku Utara</span>
          <span>Super Admin · Template standar dokumen 05 / 14 / 31</span>
        </footer>
      </div>
    </div>
  );
}

DashboardSuperAdmin.displayName = "DashboardSuperAdmin";
