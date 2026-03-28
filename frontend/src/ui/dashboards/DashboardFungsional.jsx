// frontend/src/ui/dashboards/DashboardFungsional.jsx
// A-10: Dashboard untuk peran jabatan_fungsional / pejabat_fungsional
// e-Pelara role mapping (D-10):
//   JF di Bidang            → ADMINISTRATOR (approve + verifikasi teknis)
//   JF di Sekretariat/UPTD  → PENGAWAS (view-only)
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";
import BroadcastBidangPanel from "../../components/dashboard/BroadcastBidangPanel";
import useKPIPolling from "../../hooks/useKPIPolling";

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
  return user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
}

const ALLOWED = [
  "jabatan_fungsional",
  "pejabat_fungsional",
  "fungsional",
  "fungsional_analis",
  "fungsional_perencana",
  "fungsional_ketersediaan",
  "fungsional_distribusi",
  "fungsional_konsumsi",
  "super_admin",
  "kepala_dinas",
];

export default function DashboardFungsional() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [cascadeData, setCascadeData] = useState(null);
  const [cascadeLoading, setCascadeLoading] = useState(true);
  // KPI summary — real-time polling via Socket.IO + REST fallback
  const { kpi: kpiPolled, loading: kpiLoading } = useKPIPolling("fungsional-bidang");
  const kpi = kpiPolled?.data || kpiPolled || null;
  // JF Adaptif: has_subordinate flag dari user_hierarchy
  const [hasSubordinate, setHasSubordinate] = useState(null); // null = loading
  // Panel notifikasi broadcast UPTD
  const [notifList, setNotifList] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  // Panel notifikasi perintah Sekretaris untuk Fungsional Perencana
  const [notifSekretarisPerencana, setNotifSekretarisPerencana] = useState([]);
  const [notifSekretarisPerencanaLoading, setNotifSekretarisPerencanaLoading] =
    useState(true);

  // KPI polling handled by useKPIPolling("fungsional-bidang") above

  // Fetch has_subordinate flag dari user_hierarchy API
  useEffect(() => {
    if (!user) return;
    api
      .get("/auth/hierarchy")
      .then((res) => {
        const data = res.data?.data || res.data;
        setHasSubordinate(data?.has_subordinate === true);
      })
      .catch(() => {
        // Fallback: deteksi dari unit_kerja jika API belum tersedia
        const unitLower = unit.toLowerCase();
        setHasSubordinate(
          unitLower.includes("ketersediaan") ||
            unitLower.includes("distribusi") ||
            unitLower.includes("konsumsi"),
        );
      });
  }, [user, unit]);

  // JF Adaptif: isBidang berdasarkan has_subordinate (API) atau unit_kerja (fallback)
  const isBidang =
    hasSubordinate === true ||
    (hasSubordinate === null &&
      (unit.includes("ketersediaan") ||
        unit.includes("distribusi") ||
        unit.includes("konsumsi")));
  const epelараRole = isBidang ? "ADMINISTRATOR" : "PENGAWAS";

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "JF-001",
        status: "akses",
        detail: "Akses modul Jabatan Fungsional",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/tasks/assigned", { params: { limit: 10 } })
      .then((res) =>
        setTugas(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setTugas([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch status dokumen yang diajukan oleh unit JF ini (approval workflow)
  useEffect(() => {
    if (!user) return;
    api
      .get("/approval/workflow", { params: { limit: 8, status: "pending" } })
      .then((res) => {
        const d = res.data;
        const all = Array.isArray(d) ? d : d?.data || [];
        setReviewData(all.slice(0, 8));
      })
      .catch(() => setReviewData([]))
      .finally(() => setReviewLoading(false));
  }, [user, unit]);

  // Cascading KPI check (gunakan endpoint internal, bukan e-Pelara langsung)
  useEffect(() => {
    if (!user) return;
    api
      .get("/dashboard/fungsional-bidang/summary", {
        params: { bidang: unit.includes("ketersediaan")
          ? "ketersediaan"
          : unit.includes("distribusi")
            ? "distribusi"
            : unit.includes("konsumsi")
              ? "konsumsi"
              : "" },
      })
      .then((res) => setCascadeData(res.data?.data ?? null))
      .catch(() => setCascadeData(null))
      .finally(() => setCascadeLoading(false));
  }, [user, unit]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/notifications?limit=10")
      .then((res) => {
        if (!cancelled) {
          setNotifList(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      })
      .catch(() => setNotifList([]))
      .finally(() => setNotifLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/notifications?limit=10")
      .then((res) => {
        if (!cancelled) {
          setNotifSekretarisPerencana(
            Array.isArray(res.data?.data)
              ? res.data.data.filter((n) =>
                  n.message?.startsWith(
                    "[Perintah Sekretaris → fungsional_perencana]",
                  ),
                )
              : [],
          );
        }
      })
      .catch(() => setNotifSekretarisPerencana([]))
      .finally(() => setNotifSekretarisPerencanaLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  // Deteksi bidang dari unit kerja user
  let bidang = "";
  if (unit.includes("ketersediaan")) bidang = "ketersediaan";
  else if (unit.includes("distribusi")) bidang = "distribusi";
  else if (unit.includes("konsumsi")) bidang = "konsumsi";

  // Opsi tujuan dan endpoint sesuai bidang
  const tujuanOptions = bidang
    ? [
        {
          value: `pelaksana_${bidang}`,
          label: `Pelaksana ${bidang.charAt(0).toUpperCase() + bidang.slice(1)}`,
        },
      ]
    : [];
  const endpoint = bidang
    ? `/notifications/broadcast-fungsional-${bidang}`
    : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Panel Perintah/Broadcast ke Pelaksana per Bidang */}
      {bidang && (
        <div className="mb-6">
          <BroadcastBidangPanel
            label={`Perintah/Broadcast ke Pelaksana ${bidang.charAt(0).toUpperCase() + bidang.slice(1)}`}
            tujuanOptions={tujuanOptions}
            endpoint={endpoint}
          />
        </div>
      )}
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900/95 to-slate-900/80 border-2 border-indigo-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🎓</span>
          Dashboard Jabatan Fungsional
        </h1>
        <p className="text-indigo-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "—"}
          </span>
          {" · "}Role e-Pelara:{" "}
          <span
            className={`font-bold ${epelараRole === "ADMINISTRATOR" ? "text-green-300" : "text-amber-300"}`}
          >
            {epelараRole}
          </span>
        </p>
      </div>

      {/* Panel Notifikasi Perintah Sekretaris untuk Fungsional Analis Keuangan */}
      <div className="mb-4">
        {notifSekretarisPerencanaLoading ? (
          <div className="bg-amber-900/80 border border-amber-400/30 rounded-xl p-4 text-amber-200 text-sm animate-pulse">
            Memuat notifikasi…
          </div>
        ) : notifSekretarisPerencana.length === 0 ? null : (
          <div className="bg-amber-900/80 border border-amber-400/30 rounded-xl p-4 text-amber-100 text-sm space-y-2">
            <div className="font-bold text-amber-200 mb-1 flex items-center gap-2">
              <span className="text-lg">📢</span> Perintah Sekretaris
            </div>
            {notifSekretarisPerencana
              .filter((n) =>
                n.message?.startsWith(
                  "[Perintah Sekretaris → fungsional_analis_keuangan]",
                ),
              )
              .map((n, i) => (
                <div
                  key={n.id ?? i}
                  className="border-b border-amber-700/30 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0"
                >
                  <span className="text-amber-100">
                    {n.message
                      .replace(
                        "[Perintah Sekretaris → fungsional_analis_keuangan]",
                        "",
                      )
                      .trim()}
                  </span>
                  <span className="block text-xs text-amber-300/70 mt-1">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString("id-ID")
                      : ""}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        {notifSekretarisPerencanaLoading ? (
          <div className="bg-amber-900/80 border border-amber-400/30 rounded-xl p-4 text-amber-200 text-sm animate-pulse">
            Memuat notifikasi…
          </div>
        ) : notifSekretarisPerencana.length === 0 ? null : (
          <div className="bg-amber-900/80 border border-amber-400/30 rounded-xl p-4 text-amber-100 text-sm space-y-2">
            <div className="font-bold text-amber-200 mb-1 flex items-center gap-2">
              <span className="text-lg">📢</span> Perintah Sekretaris
            </div>
            {notifSekretarisPerencana.map((n, i) => (
              <div
                key={n.id ?? i}
                className="border-b border-amber-700/30 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0"
              >
                <span className="text-amber-100">
                  {n.message
                    .replace("[Perintah Sekretaris → fungsional_perencana]", "")
                    .trim()}
                </span>
                <span className="block text-xs text-amber-300/70 mt-1">
                  {n.created_at
                    ? new Date(n.created_at).toLocaleString("id-ID")
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Panel Notifikasi Broadcast UPTD */}
      <div className="mb-4">
        {notifLoading ? (
          <div className="bg-indigo-900/80 border border-indigo-400/30 rounded-xl p-4 text-indigo-200 text-sm animate-pulse">
            Memuat notifikasi…
          </div>
        ) : notifList.filter((n) =>
            n.message?.startsWith("[Broadcast Kepala UPTD]"),
          ).length === 0 ? null : (
          <div className="bg-indigo-900/80 border border-indigo-400/30 rounded-xl p-4 text-indigo-100 text-sm space-y-2">
            <div className="font-bold text-indigo-200 mb-1 flex items-center gap-2">
              <span className="text-lg">📢</span> Notifikasi Kepala UPTD
            </div>
            {notifList
              .filter((n) => n.message?.startsWith("[Broadcast Kepala UPTD]"))
              .map((n, i) => (
                <div
                  key={n.id ?? i}
                  className="border-b border-indigo-700/30 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0"
                >
                  <span className="text-indigo-100">
                    {n.message.replace("[Broadcast Kepala UPTD]", "").trim()}
                  </span>
                  <span className="block text-xs text-indigo-300/70 mt-1">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString("id-ID")
                      : ""}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tugas Aktif",
            value: loading ? "…" : tugas.length,
            color: "indigo",
          },
          { label: "Verifikasi Teknis", value: "—", color: "blue" },
          { label: "Analisis Selesai", value: "—", color: "emerald" },
          { label: "Permintaan Revisi", value: "—", color: "amber" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
          >
            <div className={`text-3xl font-bold text-${kpi.color}-700`}>
              {kpi.value}
            </div>
            <div className={`text-xs font-medium text-${kpi.color}-600`}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Daftar Tugas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Tugas Ditugaskan ke Saya
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tugas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas yang ditugaskan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Judul</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Modul</th>
                </tr>
              </thead>
              <tbody>
                {tugas.map((t, i) => (
                  <tr
                    key={t.id ?? i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium">
                      {t.judul || t.title || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                        {t.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {t.modul_id || t.modulId || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renstra Sub-Kegiatan Saya — hanya untuk JF Bidang (D-10) */}
      {isBidang && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              📄 Renstra Sub-Kegiatan Saya
            </h2>
            <BukaEPelaraButton
              label="Input / Edit →"
              targetPath="/dashboard-renstra"
              className="!py-1.5 !px-3 !text-xs"
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Sub-kegiatan yang menjadi tanggung jawab teknis Anda untuk
            diisi/diverifikasi di e-Pelara.
          </p>
          <div className="flex flex-wrap gap-2">
            <BukaEPelaraButton
              label="Form Input Target & Indikator"
              targetPath="/dashboard-renstra"
              className="!py-2 !px-3 !text-xs"
            />
            <BukaEPelaraButton
              label="Draft Renja Bidang"
              targetPath="/dashboard-renja"
              className="!py-2 !px-3 !text-xs"
            />
            <BukaEPelaraButton
              label="Cascading Check"
              targetPath="/dashboard-renstra"
              className="!py-2 !px-3 !text-xs"
            />
          </div>
        </div>
      )}

      {/* ─── PANEL STATUS REVIEW ATASAN — Priority 2 ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📬 Status Review Atasan
          </h2>
          <BukaEPelaraButton
            label="Lihat Semua →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Status dokumen yang sudah Anda ajukan — apakah sudah diverifikasi
          Sekretaris atau disetujui Kepala Dinas.
        </p>
        {reviewLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat status review…
          </p>
        ) : reviewData.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada dokumen yang diajukan dari unit Anda.
          </p>
        ) : (
          <div className="space-y-2">
            {reviewData.map((dok, i) => {
              const st = dok.status ?? "draft";
              const stepsMap = [
                "draft",
                "diajukan",
                "diverifikasi",
                "disetujui",
              ];
              const stepIdx = stepsMap.indexOf(st);
              const stepColors = [
                "bg-gray-300 text-gray-600",
                "bg-amber-400 text-white",
                "bg-blue-500 text-white",
                "bg-green-500 text-white",
              ];
              return (
                <div
                  key={dok.id ?? i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {dok.judul ?? dok.jenis_dokumen ?? `Dokumen #${i + 1}`}
                    </p>
                    <p className="text-xs text-gray-400">{dok.tahun ?? "—"}</p>
                  </div>
                  {/* Progress steps horizontal */}
                  <div className="flex items-center gap-1 shrink-0">
                    {stepsMap.map((step, si) => (
                      <div key={step} className="flex items-center gap-1">
                        <span
                          className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                            si <= stepIdx
                              ? (stepColors[si] ?? "bg-green-500 text-white")
                              : "bg-gray-200 text-gray-400"
                          }`}
                          title={step}
                        >
                          {si + 1}
                        </span>
                        {si < stepsMap.length - 1 && (
                          <div
                            className={`w-4 h-0.5 ${si < stepIdx ? "bg-green-400" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    ))}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        stepIdx === -1 || st === "ditolak"
                          ? "bg-red-100 text-red-700"
                          : st === "disetujui"
                            ? "bg-green-100 text-green-700"
                            : st === "diverifikasi"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Cascading Check ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🔗 Cascading Check Perencanaan
        </h2>
        {cascadeLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data cascading…
          </p>
        ) : (
          <div className="space-y-2">
            {(() => {
              const tujuanArr = Array.isArray(cascadeData?.tujuan)
                ? cascadeData.tujuan
                : [];
              const sasaranArr = Array.isArray(cascadeData?.sasaran)
                ? cascadeData.sasaran
                : [];
              const renstraArr = Array.isArray(cascadeData?.renstraOpd)
                ? cascadeData.renstraOpd
                : [];
              const renstraDisetujui = renstraArr.filter(
                (d) => d.status === "disetujui",
              ).length;
              const steps = [
                {
                  label: "Tujuan Renstra",
                  ok: tujuanArr.length > 0,
                  detail: `${tujuanArr.length} tujuan`,
                },
                {
                  label: "Sasaran Strategis",
                  ok: sasaranArr.length > 0,
                  detail: `${sasaranArr.length} sasaran`,
                },
                {
                  label: "Renstra OPD disetujui",
                  ok: renstraDisetujui > 0,
                  detail: `${renstraDisetujui}/${renstraArr.length} disetujui`,
                },
                {
                  label: "Renja/DPA ter-cascade",
                  ok: renstraArr.length >= 2,
                  detail:
                    renstraArr.length >= 2
                      ? "Terindikasi cukup"
                      : "Belum cukup data",
                },
              ];
              const allOk = steps.every((s) => s.ok);
              return (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                          step.ok
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                      >
                        <span className="text-base">
                          {step.ok ? "✅" : "❌"}
                        </span>
                        <div>
                          <div className="font-semibold">{step.label}</div>
                          <div className="text-gray-500">{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                    <span
                      className={`text-xs font-semibold ${allOk ? "text-green-600" : "text-amber-600"}`}
                    >
                      {allOk
                        ? "✅ Cascading chain: Lengkap"
                        : "⚠️ Ada rantai yang belum terpenuhi"}
                    </span>
                    <button
                      onClick={() => {
                        setCascadeLoading(true);
                        api
                          .get("/dashboard/fungsional-bidang/summary")
                          .then((r) => setCascadeData(r.data?.data ?? null))
                          .catch(() => setCascadeData(null))
                          .finally(() => setCascadeLoading(false));
                      }}
                      className="text-xs text-gray-400 hover:text-indigo-500 transition"
                    >
                      ↺ Refresh
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* KPI Cards dari summary backend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 flex flex-col gap-1 bg-indigo-50 border-indigo-200">
          <div className="text-3xl font-bold text-indigo-700">
            {kpiLoading ? "…" : (kpi?.complianceAlurKoordinasi ?? "—")}
          </div>
          <div className="text-xs font-medium text-indigo-600">
            Compliance Koordinasi
          </div>
        </div>
        <div className="rounded-xl border p-4 flex flex-col gap-1 bg-blue-50 border-blue-200">
          <div className="text-3xl font-bold text-blue-700">
            {kpiLoading ? "…" : (kpi?.zeroBypassViolations30d ?? "—")}
          </div>
          <div className="text-xs font-medium text-blue-600">
            Zero Bypass (30h)
          </div>
        </div>
        <div className="rounded-xl border p-4 flex flex-col gap-1 bg-emerald-50 border-emerald-200">
          <div className="text-3xl font-bold text-emerald-700">
            {kpiLoading ? "…" : (kpi?.avgApprovalTimeHours ?? "—")}
          </div>
          <div className="text-xs font-medium text-emerald-600">
            Avg. Waktu Approval
          </div>
        </div>
        <div className="rounded-xl border p-4 flex flex-col gap-1 bg-amber-50 border-amber-200">
          <div className="text-3xl font-bold text-amber-700">
            {kpiLoading ? "…" : (kpi?.konsistensiDataKomoditas ?? "—")}
          </div>
          <div className="text-xs font-medium text-amber-600">
            Konsistensi Komoditas
          </div>
        </div>
      </div>

      {/* Analytics Mandiri — Quick Access */}
      <section
        aria-label="Analytics Mandiri"
        className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-xl border border-indigo-200 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-indigo-800 flex items-center gap-2">
            <span aria-hidden="true">📊</span> Analytics Mandiri
          </h2>
          <a
            href="/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Buka Analytics →
          </a>
        </div>
        <p className="text-sm text-indigo-600/80">
          Filter dan ekspor data pangan (harga, stok, inflasi, distribusi, konsumsi)
          berdasarkan wilayah, komoditas, dan periode waktu pilihan Anda.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {["Harga Rata-rata", "Volume Stok", "Inflasi (%)", "Distribusi", "Konsumsi"].map(
            (ind) => (
              <span
                key={ind}
                className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200"
              >
                {ind}
              </span>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
