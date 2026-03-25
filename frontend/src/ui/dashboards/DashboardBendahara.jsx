// frontend/src/ui/dashboards/DashboardBendahara.jsx
// A-10 + A-11: Dashboard Bendahara
// CONSTRAINT KERAS (A-11): TIDAK ADA tombol / link SPJ.
// SPJ (Surat Pertanggungjawaban) hanya di-trigger dari alur persetujuan kepala dinas,
// bukan dari dashboard bendahara langsung — keputusan desain D-Final.
// config/roles.json: bendahara → create_draft, upload_finance_evidence, submit_finance, view_finance_queue
// e-Pelara role (D-10): bendahara → DRAFTER (dapat buat draft dokumen keuangan)
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import api from "../../utils/api";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

const ALLOWED = ["bendahara", "super_admin", "sekretaris", "kepala_dinas"];

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  "menunggu verifikasi": "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardBendahara() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dpaRealisasi, setDpaRealisasi] = useState([]);
  const [dpaLoading, setDpaLoading] = useState(true);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "BND-001",
        status: "akses",
        detail: "Akses dashboard Bendahara",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/keuangan/queue", { params: { limit: 10 } })
      .then((res) =>
        setQueue(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [],
        ),
      )
      .catch(() => setQueue([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDpaLoading(true);
    api
      .get("/api/epelara/dpa", { params: { limit: 8 } })
      .then((res) => {
        const d = res.data;
        setDpaRealisasi(
          Array.isArray(d) ? d.slice(0, 8) : d?.data?.slice(0, 8) || [],
        );
      })
      .catch(() => setDpaRealisasi([]))
      .finally(() => setDpaLoading(false));
  }, [user]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero — INTENTIONALLY NO SPJ BUTTON (A-11) */}
      <div className="bg-gradient-to-r from-emerald-900/95 to-slate-900/80 border-2 border-emerald-700/50 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">💼</span>
          Dashboard Bendahara
        </h1>
        <p className="text-emerald-200/80 text-sm">
          Unit:{" "}
          <span className="font-semibold text-white">
            {user?.unit_kerja || "—"}
          </span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Draft Keuangan",
            value: loading
              ? "…"
              : queue.filter((q) => q.status === "pending").length,
            color: "amber",
          },
          {
            label: "Menunggu Verifikasi",
            value: loading
              ? "…"
              : queue.filter((q) => (q.status || "").includes("verifikasi"))
                  .length,
            color: "blue",
          },
          {
            label: "Disetujui",
            value: loading
              ? "…"
              : queue.filter((q) => q.status === "approved").length,
            color: "emerald",
          },
          {
            label: "Ditolak",
            value: loading
              ? "…"
              : queue.filter((q) => q.status === "rejected").length,
            color: "red",
          },
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

      {/* Antrean Keuangan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">💰 Antrean Keuangan</h2>
        {/* NOTE (A-11): Tombol proses SPJ sengaja dihapus dari tampilan ini.
            SPJ hanya dapat diproses melalui alur persetujuan Kepala Dinas. */}
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat antrean…</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Antrean keuangan kosong.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Deskripsi</th>
                  <th className="px-3 py-2 text-right">Jumlah</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q, i) => (
                  <tr
                    key={q.id ?? i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 font-medium">
                      {q.deskripsi || q.description || q.judul || "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {q.jumlah != null
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(q.jumlah)
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[q.status?.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {q.status || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">
                      {q.tanggal || q.created_at?.split("T")[0] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel DPA Aktif + RKA — Bagian IV, Role 8 */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📋 DPA &amp; RKA Aktif
          </h2>
          <BukaEPelaraButton
            label="Lihat DPA Lengkap →"
            targetPath="/dashboard-dpa"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="font-semibold text-emerald-800 mb-1 text-sm">
              📊 DPA yang Disahkan
            </div>
            <p className="text-xs text-emerald-600">
              Dokumen Pelaksanaan Anggaran tahun berjalan. Gunakan sebagai acuan
              verifikasi SPJ dari Pelaksana.
            </p>
            <BukaEPelaraButton
              label="Buka DPA →"
              targetPath="/dashboard-dpa"
              className="!py-1.5 !px-3 !text-xs mt-2"
            />
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="font-semibold text-blue-800 mb-1 text-sm">
              💰 RKA per Kegiatan
            </div>
            <p className="text-xs text-blue-600">
              Rencana Kerja & Anggaran rinci per sub-kegiatan. Gunakan untuk
              memeriksa kesesuaian nilai SPJ dengan pagu RKA.
            </p>
            <BukaEPelaraButton
              label="Buka RKA →"
              targetPath="/dashboard-rka"
              className="!py-1.5 !px-3 !text-xs mt-2"
            />
          </div>
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            <strong>Catatan (A-11):</strong> Bendahara hanya{" "}
            <em>memverifikasi</em> SPJ dari Pelaksana sesuai pagu DPA. Bendahara
            tidak membuat SPJ sendiri.
          </p>
        </div>
      </div>

      {/* ─── PANEL REALISASI vs PAGU — Priority 2 ─── */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📊 Realisasi vs Pagu Anggaran
          </h2>
          <BukaEPelaraButton
            label="Lihat DPA Lengkap →"
            targetPath="/dashboard-dpa"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
        {dpaLoading ? (
          <p className="text-sm text-gray-400 animate-pulse">
            Memuat data pagu…
          </p>
        ) : dpaRealisasi.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Data DPA belum tersedia dari e-Pelara.
          </p>
        ) : (
          <div className="space-y-4">
            {dpaRealisasi.map((row, i) => {
              const pagu = Number(
                row.pagu_anggaran ?? row.anggaranTotal ?? row.pagu ?? 0,
              );
              const realisasi = Number(
                row.realisasi_anggaran ?? row.realisasi ?? 0,
              );
              const pct =
                pagu > 0
                  ? Math.min(Math.round((realisasi / pagu) * 100), 100)
                  : 0;
              const sisa = pagu > realisasi ? pagu - realisasi : 0;
              const barColor =
                pct >= 90
                  ? "bg-green-500"
                  : pct >= 60
                    ? "bg-teal-500"
                    : pct >= 30
                      ? "bg-amber-400"
                      : "bg-red-400";
              return (
                <div key={row.id ?? i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-800 max-w-[260px] truncate">
                      {row.nama_program ??
                        row.program ??
                        row.nama_kegiatan ??
                        row.nama ??
                        `Kegiatan #${i + 1}`}
                    </span>
                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 90
                            ? "bg-green-100 text-green-700"
                            : pct >= 60
                              ? "bg-teal-100 text-teal-700"
                              : pct >= 30
                                ? "bg-amber-100 text-amber-700"
                                : pagu > 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pagu > 0 ? `${pct}%` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${pagu > 0 ? pct : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      Realisasi:{" "}
                      <span className="font-medium text-gray-600">
                        Rp{" "}
                        {realisasi > 0
                          ? realisasi.toLocaleString("id-ID")
                          : "0"}
                      </span>
                    </span>
                    <span>
                      Pagu:{" "}
                      <span className="font-medium text-gray-600">
                        Rp {pagu > 0 ? pagu.toLocaleString("id-ID") : "—"}
                      </span>
                      {sisa > 0 && (
                        <span className="ml-2 text-amber-600">
                          · Sisa: Rp {sisa.toLocaleString("id-ID")}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Bukti */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">📎 Aksi Keuangan</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/keuangan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
          >
            📊 Modul Keuangan Lengkap
          </a>
          {/* TIDAK ADA tombol SPJ di sini — (A-11) */}
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>DRAFTER</strong> — Anda dapat membuat dan mengupdate
          draft dokumen perencanaan keuangan.
        </p>
        <BukaEPelaraButton
          label="Buka e-Pelara — Keuangan"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
