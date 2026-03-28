// frontend/src/ui/dashboards/DashboardKasiMutu.jsx
// Dashboard Kepala Seksi Manajemen Mutu UPTD
// Roles: kasi_mutu_uptd, seksi_manajemen_mutu, kasi_mutu
// e-Pelara: PENGAWAS (view-only, UPTD bukan bidang program)
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";
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

const ALLOWED = [
  "seksi_manajemen_mutu",
  "kasi_mutu",
  "kasi_mutu_uptd",
  "super_admin",
  "kepala_dinas",
  "kepala_uptd",
];

export default function DashboardKasiMutu() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const { kpi: kpiPolled, loading: kpiLoading } = useKPIPolling("kasi-uptd");
  const kpi = kpiPolled?.data || kpiPolled || null;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KASI-MTU-001",
        status: "akses",
        detail: "Akses dashboard Kepala Seksi Manajemen Mutu UPTD",
      });
    }
  }, [user]);

  // KPI is handled by useKPIPolling("kasi-uptd") above

  // Fetch antrian verifikasi mutu (upt-mtu tasks)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    api
      .get("/upt-mtu", { params: { limit: 10, status: "submitted" } })
      .then((res) => {
        if (!cancelled) {
          setReports(
            Array.isArray(res.data?.data)
              ? res.data.data
              : Array.isArray(res.data)
                ? res.data
                : [],
          );
        }
      })
      .catch(() => {
        if (!cancelled) setReports([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Broadcast notifications from Kepala UPTD
  useEffect(() => {
    let cancelled = false;
    setNotifLoading(true);
    api
      .get("/notifications?limit=10")
      .then((res) => {
        if (!cancelled)
          setNotifList(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => setNotifList([]))
      .finally(() => setNotifLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const broadcastNotifs = notifList.filter((n) =>
    n.message?.startsWith("[Broadcast Kepala UPTD]"),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Skip to content — aksesibilitas WCAG 2.1 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white text-teal-800 px-4 py-2 rounded shadow z-50 font-semibold"
      >
        Lewati navigasi
      </a>

      {/* Hero */}
      <header
        role="banner"
        className="bg-gradient-to-r from-teal-900/95 to-slate-900/80 border-2 border-teal-700/50 rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">
            🔬
          </span>
          Dashboard Kepala Seksi Manajemen Mutu
        </h1>
        <p className="text-teal-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "UPTD Balai Pengawasan Mutu"}
          </span>
          {" · "}Role e-Pelara:{" "}
          <span className="font-bold text-amber-300">PENGAWAS</span>
        </p>
      </header>

      {/* Notifikasi Broadcast */}
      {!notifLoading && broadcastNotifs.length > 0 && (
        <section
          aria-label="Notifikasi dari Kepala UPTD"
          className="bg-teal-900/80 border border-teal-400/30 rounded-xl p-4 text-teal-100 text-sm space-y-2"
        >
          <div className="font-bold text-teal-200 mb-1 flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              📢
            </span>{" "}
            Notifikasi Kepala UPTD
          </div>
          {broadcastNotifs.map((n, i) => (
            <div
              key={n.id ?? i}
              className="border-b border-teal-700/30 pb-2 mb-2 last:mb-0 last:pb-0 last:border-0"
            >
              <span className="text-teal-100">
                {n.message.replace("[Broadcast Kepala UPTD]", "").trim()}
              </span>
              <span className="block text-xs text-teal-300/70 mt-1">
                {n.created_at
                  ? new Date(n.created_at).toLocaleString("id-ID")
                  : ""}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* KPI Tiles */}
      <section aria-label="Indikator Kinerja Utama" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Antrian Verifikasi",
            value: kpiLoading ? "…" : (kpi?.antrianVerifikasi ?? reports.length),
            color: "blue",
            desc: "Dokumen menunggu verifikasi mutu",
          },
          {
            label: "Selesai Diverifikasi",
            value: kpiLoading ? "…" : (kpi?.selesaiDiverifikasi30d ?? "—"),
            color: "emerald",
            desc: "30 hari terakhir",
          },
          {
            label: "Inspeksi Pending",
            value: kpiLoading ? "…" : (kpi?.inspeksiPending ?? "—"),
            color: "amber",
            desc: "Belum selesai",
          },
          {
            label: "Hasil Lab Pending",
            value: "—",
            color: "red",
            desc: "Menunggu hasil laboratorium",
          },
        ].map((kpiItem) => (
          <div
            key={kpiItem.label}
            role="region"
            aria-label={kpiItem.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpiItem.color}-50 border-${kpiItem.color}-200`}
          >
            <div
              className={`text-3xl font-bold text-${kpiItem.color}-700`}
              aria-live="polite"
            >
              {kpiItem.value}
            </div>
            <div className={`text-xs font-semibold text-${kpiItem.color}-700`}>
              {kpiItem.label}
            </div>
            <div className={`text-xs text-${kpiItem.color}-500`}>
              {kpiItem.desc}
            </div>
          </div>
        ))}
      </section>

      {/* Antrian Verifikasi Mutu */}
      <main id="main-content">
        <section
          aria-label="Antrian Verifikasi Mutu"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-gray-800 mb-4">
            📋 Antrian Verifikasi Mutu
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 animate-pulse" aria-live="polite">
              Memuat data…
            </p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Belum ada antrian verifikasi mutu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" role="table" aria-label="Daftar antrian verifikasi mutu">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">Judul</th>
                    <th scope="col" className="px-3 py-2 text-left">Status</th>
                    <th scope="col" className="px-3 py-2 text-left">Diajukan Oleh</th>
                    <th scope="col" className="px-3 py-2 text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr
                      key={r.id ?? i}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800 max-w-[240px] truncate">
                        {r.title || r.judul || r.nama_kegiatan || `Dokumen #${i + 1}`}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === "approved" || r.status === "disetujui"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.status === "submitted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {r.created_by || r.penanggung_jawab || "—"}
                      </td>
                      <td className="px-3 py-2 text-gray-400 text-xs">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("id-ID")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Wewenang */}
        <section
          aria-label="Wewenang Kepala Seksi Manajemen Mutu"
          className="bg-teal-50 border border-teal-200 rounded-xl p-5 mt-6"
        >
          <h2 className="font-bold text-teal-800 mb-3">
            🛡️ Wewenang Seksi Manajemen Mutu
          </h2>
          <ul className="space-y-1 text-sm text-teal-700">
            <li>✅ Verifikasi teknis hasil laboratorium mutu pangan</li>
            <li>✅ Memberikan koreksi teknis dan catatan verifikasi</li>
            <li>✅ Menugaskan tindak lanjut ke staf teknis</li>
            <li>🚫 Tidak dapat melakukan final approve (hak Kepala UPTD)</li>
            <li>🚫 Tidak dapat mengakses data keuangan/kepegawaian lintas unit</li>
          </ul>
        </section>

        {/* e-Pelara */}
        <section
          aria-label="Akses e-Pelara"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-6"
        >
          <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
          <p className="text-xs text-gray-500 mb-3">
            Sebagai <strong>PENGAWAS</strong> — Anda dapat memantau dokumen
            perencanaan UPTD (view-only).
          </p>
          <BukaEPelaraButton
            label="Buka e-Pelara — UPTD"
            targetPath="/"
            className="w-full md:w-auto"
          />
        </section>
      </main>
    </div>
  );
}
