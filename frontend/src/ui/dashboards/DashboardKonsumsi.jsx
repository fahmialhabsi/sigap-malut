// frontend/src/ui/dashboards/DashboardKonsumsi.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import { fetchBksEvlSummary } from "../../services/bksEvlService";
import { roleIdToName } from "../../utils/roleMap";
import DashboardKonsumsiLayout from "../../layouts/DashboardKonsumsiLayout";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function normalizeUnit(user) {
  const v = user?.unit_kerja || user?.unit_id || "";
  return v ? String(v).toLowerCase() : "";
}

function formatNumber(v, digits = 1) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(digits);
}

function StatCard({ value, label }) {
  return (
    <div
      className="
        rounded-xl border border-slate-200 bg-white/80 p-4
        shadow-sm backdrop-blur
        dark:border-slate-800 dark:bg-slate-900/60
      "
    >
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </div>
    </div>
  );
}

function KpiCard({ title, idLabel, children, footer }) {
  return (
    <div
      className="
        rounded-2xl border border-slate-200 bg-white/80 p-5
        shadow-sm backdrop-blur
        dark:border-slate-800 dark:bg-slate-900/60
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-pink-700 dark:text-pink-300">
            {title}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {idLabel}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-800 dark:text-slate-200">
        {children}
      </div>

      {footer ? (
        <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardKonsumsi() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const isAllowed =
    !!user &&
    (roleName === "super_admin" ||
      roleName === "kepala_dinas" ||
      roleName === "gubernur" ||
      roleName === "kepala_bidang_konsumsi" ||
      (roleName === "kepala_bidang" && unit.includes("konsumsi")));

  const [summary, setSummary] = React.useState(null);
  const [loadingSummary, setLoadingSummary] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    workflowStatusUpdateAPI({
      user,
      modulId: "C001",
      status: "akses",
      detail: "Akses modul Konsumsi pangan",
    });

    setLoadingSummary(true);
    fetchBksEvlSummary()
      .then((data) => setSummary(data || null))
      .finally(() => setLoadingSummary(false));
  }, [user]);

  if (!isAllowed) return <Navigate to="/" replace />;

  const energi = summary?.konsumsi_pangan?.energi_kkal_per_kapita ?? null;
  const protein = summary?.konsumsi_pangan?.protein_g_per_kapita ?? null;

  const pphCapaian = summary?.skor_pph?.capaian ?? null;
  const pphTarget = summary?.skor_pph?.target ?? null;
  const pphStatus = summary?.skor_pph?.status ?? null;

  const meta = summary?.meta || null;

  const footerCommon = (
    <>
      <span className="font-medium text-slate-600 dark:text-slate-300">
        Sumber:
      </span>{" "}
      {meta?.source || "-"}
      {meta?.periode ? ` • Periode: ${meta.periode}` : ""}
      {meta?.tahun ? ` • Tahun: ${meta.tahun}` : ""}
      {meta?.bulan ? ` • Bulan: ${meta.bulan}` : ""}
    </>
  );

  return (
    <DashboardKonsumsiLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard Bidang Konsumsi
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Ringkasan KPI dan modul Bidang Konsumsi
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard value="25" label="Indikator Monitoring" />
        <StatCard value="96%" label="Compliance Alur" />
        <StatCard value="0" label="Bypass Terdeteksi" />
        <StatCard value="98%" label="Data Valid" />
      </div>

      {/* KPI Cards */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          KPI Utama (Real Data)
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {loadingSummary
            ? "Memuat..."
            : meta?.hasData
              ? "Terbaru"
              : "Belum ada data"}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <KpiCard
          title="Konsumsi pangan"
          idLabel="ID: C001"
          footer={footerCommon}
        >
          {loadingSummary ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Memuat data KPI...
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Energi
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(energi, 1)}{" "}
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    kkal/kapita/hari
                  </span>
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Protein
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(protein, 1)}{" "}
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    g/kapita/hari
                  </span>
                </span>
              </div>

              {!meta?.hasData && (
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-300">
                  Belum ada data di tabel BKS-EVL. Silakan input minimal 1
                  record.
                </div>
              )}
            </>
          )}
        </KpiCard>

        <KpiCard title="Skor PPH" idLabel="ID: C002" footer={footerCommon}>
          {loadingSummary ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Memuat data KPI...
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Capaian
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(pphCapaian, 2)}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Target
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(pphTarget, 2)}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300">
                  Status
                </span>
                <span
                  className={[
                    "font-semibold",
                    pphStatus === "On Target"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : pphStatus === "Di Bawah Target"
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-slate-900 dark:text-slate-100",
                  ].join(" ")}
                >
                  {pphStatus || "-"}
                </span>
              </div>

              {!meta?.hasData && (
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-300">
                  Belum ada data di tabel BKS-EVL. Silakan input minimal 1
                  record.
                </div>
              )}
            </>
          )}
        </KpiCard>
      </div>
    </DashboardKonsumsiLayout>
  );
}
