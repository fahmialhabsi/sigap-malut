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

function clampPercentage(value, max) {
  const n = Number(value);
  if (Number.isNaN(n) || max <= 0) return 0;
  return Math.max(0, Math.min((n / max) * 100, 100));
}

function HeroCard({ title, value, accent = "emerald" }) {
  const accentMap = {
    emerald: {
      bg: "bg-gradient-to-t from-green-900/80 to-green-700/60",
      border: "border-green-700",
      title: "text-green-200",
      value: "text-green-100",
    },
    blue: {
      bg: "bg-gradient-to-t from-blue-900/80 to-blue-700/60",
      border: "border-blue-700",
      title: "text-blue-200",
      value: "text-blue-100",
    },
    amber: {
      bg: "bg-gradient-to-t from-yellow-700/80 to-yellow-600/70",
      border: "border-yellow-600",
      title: "text-yellow-100",
      value: "text-yellow-50",
    },
    red: {
      bg: "bg-gradient-to-t from-red-900/80 to-red-700/60",
      border: "border-red-900",
      title: "text-red-200",
      value: "text-red-100",
    },
  };
  const theme = accentMap[accent] || accentMap.emerald;

  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 min-h-[86px] flex flex-col justify-between shadow-lg ${theme.bg} ${theme.border}`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className={`text-2xl font-extrabold tracking-wide ${theme.value}`}>
        {value}
      </div>
      <div className={`text-xs font-semibold ${theme.title}`}>{title}</div>
    </div>
  );
}

function PanelBox({ title, accent = "emerald", children, className = "" }) {
  const accentMap = {
    emerald: "text-green-200",
    blue: "text-blue-200",
    amber: "text-yellow-200",
    red: "text-red-200",
  };
  const titleColor = accentMap[accent] || accentMap.emerald;

  return (
    <section
      className={`rounded-2xl p-7 flex flex-col border border-green-900/60 shadow-md flex-1 bg-green-900/80 ${className}`}
      style={{
        backdropFilter: "blur(17px)",
        WebkitBackdropFilter: "blur(17px)",
      }}
    >
      <h2
        className={`font-bold mb-4 text-xl flex items-center gap-2 ${titleColor}`}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function StatusBadge({ value }) {
  const normalized = String(value || "").toLowerCase();
  const badgeClass = normalized.includes("target")
    ? "bg-emerald-700/60 text-emerald-100"
    : normalized.includes("bawah")
      ? "bg-amber-700/50 text-amber-100"
      : "bg-green-700/60 text-green-100";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}
    >
      {value || "Belum tersedia"}
    </span>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-green-800/70 py-2 text-sm last:border-b-0">
      <span className="text-green-100/90">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-green-700 bg-green-900/60 px-3 py-2">
      <div className="text-xs text-green-200/80">{label}</div>
      <div className="text-sm font-semibold text-green-50">{value}</div>
    </div>
  );
}

function EmptyLine({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-green-700 bg-green-900/60 px-3 py-2 text-xs text-green-100/85">
      {text}
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

  const trendRows = [
    { label: "Energi", value: Number(energi || 0), max: 2400 },
    { label: "Protein", value: Number(protein || 0), max: 100 },
    { label: "Skor PPH", value: Number(pphCapaian || 0), max: 100 },
  ];

  const heroCards = [
    {
      title: "Konsumsi (kkal)",
      value: formatNumber(energi, 1),
      accent: "emerald",
    },
    {
      title: "Protein (g)",
      value: formatNumber(protein, 1),
      accent: "blue",
    },
    {
      title: "Skor PPH",
      value: formatNumber(pphCapaian, 2),
      accent: "amber",
    },
    {
      title: "Target PPH",
      value: formatNumber(pphTarget, 2),
      accent: "red",
    },
    {
      title: "Status",
      value: pphStatus || "-",
      accent: "blue",
    },
    {
      title: "Approval",
      value: meta?.hasData ? "Siap" : "Pending",
      accent: "amber",
    },
  ];

  const footerCommon = (
    <>
      <span className="font-medium text-green-100/80">Sumber:</span>{" "}
      {meta?.source || "-"}
      {meta?.periode ? ` | Periode: ${meta.periode}` : ""}
      {meta?.tahun ? ` | Tahun: ${meta.tahun}` : ""}
      {meta?.bulan ? ` | Bulan: ${meta.bulan}` : ""}
    </>
  );

  return (
    <DashboardKonsumsiLayout>
      <div className="mx-auto w-full max-w-7xl px-2 md:px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {heroCards.map((card) => (
            <HeroCard
              key={card.title}
              title={card.title}
              value={loadingSummary ? "..." : card.value}
              accent={card.accent}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-9">
          <PanelBox
            title="Tabel Data Konsumsi"
            accent="emerald"
            className="xl:min-h-[120px]"
          >
            {loadingSummary ? (
              <EmptyLine text="Memuat data konsumsi..." />
            ) : (
              <div>
                <MetricRow
                  label="Energi per Kapita"
                  value={`${formatNumber(energi, 1)} kkal/kapita/hari`}
                />
                <MetricRow
                  label="Protein per Kapita"
                  value={`${formatNumber(protein, 1)} g/kapita/hari`}
                />
                <MetricRow
                  label="Skor PPH"
                  value={formatNumber(pphCapaian, 2)}
                />
                <MetricRow
                  label="Target PPH"
                  value={formatNumber(pphTarget, 2)}
                />
                <div className="pt-2 text-xs text-green-100/75 truncate">
                  {footerCommon}
                </div>
              </div>
            )}
          </PanelBox>

          <PanelBox
            title="Grafik Tren Konsumsi"
            accent="blue"
            className="xl:min-h-[120px]"
          >
            {loadingSummary ? (
              <EmptyLine text="Memuat tren..." />
            ) : (
              <div className="space-y-3">
                {trendRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs text-green-100/80 mb-1">
                      <span>{row.label}</span>
                      <span className="font-semibold text-slate-100">
                        {formatNumber(
                          row.value,
                          row.label === "Skor PPH" ? 2 : 1,
                        )}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-green-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${clampPercentage(row.value, row.max)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelBox>
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-9">
          <PanelBox
            title="Log Survey / Mutasi"
            accent="amber"
            className="xl:min-h-[100px]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-2">
              <InfoCard
                label="Periode"
                value={meta?.periode || "Belum tersedia"}
              />
              <InfoCard label="Tahun" value={meta?.tahun || "Belum tersedia"} />
              <InfoCard label="Bulan" value={meta?.bulan || "Belum tersedia"} />
            </div>
          </PanelBox>

          <PanelBox
            title="Approval Konsumsi"
            accent="red"
            className="xl:min-h-[100px]"
          >
            <div className="space-y-2 text-sm text-green-100">
              <div className="flex items-center justify-between">
                <span>Status KPI PPH</span>
                <StatusBadge value={pphStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span>Kesiapan Data</span>
                <StatusBadge
                  value={meta?.hasData ? "Siap Approve" : "Pending"}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Validasi Bulanan</span>
                <StatusBadge
                  value={meta?.hasData ? "Terverifikasi" : "Menunggu"}
                />
              </div>
            </div>
          </PanelBox>
        </div>

        <div className="mt-8">
          <PanelBox
            title="Notifikasi Kritis"
            accent="amber"
            className="xl:min-h-[60px] !bg-gradient-to-r !from-green-900/95 !to-slate-900/80"
          >
            {meta?.hasData ? (
              <div className="text-sm text-green-100/90">
                Data indikator konsumsi sudah masuk. Lanjutkan monitoring dan
                approval berkala.
              </div>
            ) : (
              <div className="text-sm text-red-300 font-medium">
                Belum ada data di tabel BKS-EVL. Silakan input minimal satu
                record agar evaluasi konsumsi dapat diproses.
              </div>
            )}
          </PanelBox>
        </div>
      </div>
    </DashboardKonsumsiLayout>
  );
}
