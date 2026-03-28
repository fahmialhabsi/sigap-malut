// frontend/src/ui/dashboards/DashboardKetersediaan.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import DashboardKetersediaanLayout from "../../layouts/DashboardKetersediaanLayout";
import ketersediaanModules from "../../data/ketersediaanModules";
import api from "../../utils/api";
import SkipToContent from "../../components/ui/SkipToContent";
import useRoleGuard from "../../hooks/useRoleGuard";
import useKPIPolling from "../../hooks/useKPIPolling";

const ALLOWED_ROLES = [
  "kepala_bidang", "kepala_bidang_ketersediaan",
  "kasubbag", "fungsional_ketersediaan", "sekretaris",
  "kepala_dinas", "super_admin",
];

// Wrapper: re-export layout yang baru sehingga route yang sudah ada tetap bekerja.
// Jika Anda ingin menyimpan implementasi lama (dashboard ringkas), lihat DashboardKetersediaanLegacy.jsx
export default function DashboardKetersediaan(props) {
  const { allowed, redirect } = useRoleGuard(ALLOWED_ROLES);
  const { kpi: liveKpi } = useKPIPolling("ketersediaan");
  // Panel perintah ke Fungsional/Pelaksana Ketersediaan
  const tujuanOptions = [
    { value: "fungsional_ketersediaan", label: "Fungsional Ketersediaan" },
    { value: "pelaksana_ketersediaan", label: "Pelaksana Ketersediaan" },
  ];
  // Endpoint backend bisa disesuaikan jika perlu
  const broadcastEndpoint = "/notifications/broadcast-bidang-ketersediaan";
  // Import komponen panel
  const BroadcastBidangPanel = React.lazy(
    () => import("../../components/dashboard/BroadcastBidangPanel"),
  );
  const [subKegForm, setSubKegForm] = useState({
    nama: "",
    sasaran: "",
    indikator: "",
    pagu: "",
    keterangan: "",
  });
  const [subKegSubmitting, setSubKegSubmitting] = useState(false);
  const [subKegResult, setSubKegResult] = useState(null);
  const [subKegList, setSubKegList] = useState([]);
  const [subKegListLoading, setSubKegListLoading] = useState(false);

  useEffect(() => {
    setSubKegListLoading(true);
    api
      .get("/api/sub-kegiatan-usul", { params: { bidang: "ketersediaan" } })
      .then((res) =>
        setSubKegList(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setSubKegList([]))
      .finally(() => setSubKegListLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subKegForm.nama.trim()) return;
    setSubKegSubmitting(true);
    setSubKegResult(null);
    try {
      const res = await api.post("/api/sub-kegiatan-usul", {
        nama_sub_kegiatan: subKegForm.nama,
        sasaran: subKegForm.sasaran,
        indikator: subKegForm.indikator,
        pagu_usulan: subKegForm.pagu || undefined,
        keterangan: subKegForm.keterangan,
        bidang: "ketersediaan",
      });
      setSubKegResult({ ok: true });
      setSubKegForm({
        nama: "",
        sasaran: "",
        indikator: "",
        pagu: "",
        keterangan: "",
      });
      if (res.data?.data) {
        setSubKegList((prev) => [res.data.data, ...prev]);
      }
    } catch {
      setSubKegResult({ ok: false });
    } finally {
      setSubKegSubmitting(false);
    }
  };

  // Auth guard — setelah semua hooks
  if (!allowed) return <Navigate to={redirect} replace />;

  return (
    <DashboardKetersediaanLayout
      fallbackModules={ketersediaanModules}
      {...props}
    >
      <SkipToContent />
      {liveKpi && (
        <section aria-label="Status Stok Live" aria-live="polite"
          className="mx-6 mt-4 p-3 rounded-xl bg-green-900/30 border border-green-700/40 flex flex-wrap gap-6 text-sm">
          <span className="text-green-200">Stok Aman: <strong className="text-white">{liveKpi.aman ?? "—"}</strong></span>
          <span className="text-yellow-200">Waspada: <strong className="text-white">{liveKpi.waspada ?? "—"}</strong></span>
          <span className="text-red-200">Kritis: <strong className="text-white">{liveKpi.kritis ?? "—"}</strong></span>
          <span className="text-green-100">Total: <strong className="text-white">{liveKpi.total ?? "—"}</strong> | Aman: <strong className="text-white">{liveKpi.persenAman ?? "—"}%</strong></span>
        </section>
      )}
      <main id="main-content" aria-label="Konten Utama Dashboard Ketersediaan">
      {/* Panel Perintah/Broadcast ke Fungsional & Pelaksana Ketersediaan */}
      <React.Suspense fallback={<div>Memuat panel perintah…</div>}>
        <div className="mb-8">
          <BroadcastBidangPanel
            tujuanOptions={tujuanOptions}
            endpoint={broadcastEndpoint}
            label="Perintah ke Fungsional/Pelaksana Ketersediaan"
          />
        </div>
      </React.Suspense>
      {/* ─── Form Usulan Sub-Kegiatan — Priority 3 ─── */}
      <div className="rounded-2xl border border-green-700/50 bg-gradient-to-br from-green-900/90 to-slate-900/80 p-6 shadow-xl">
        <h2 className="font-bold text-green-100 text-lg mb-1">
          📝 Usulan Sub-Kegiatan — Bidang Ketersediaan
        </h2>
        <p className="text-xs text-green-300/80 mb-4">
          Ajukan sub-kegiatan baru untuk perencanaan anggaran Bidang
          Ketersediaan.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-green-200 block mb-1">
                Nama Sub-Kegiatan <span className="text-red-400">*</span>
              </label>
              <input
                required
                maxLength={300}
                value={subKegForm.nama}
                onChange={(e) =>
                  setSubKegForm((s) => ({ ...s, nama: e.target.value }))
                }
                placeholder="Contoh: Pemantauan Stok Pangan Strategis 2025"
                className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-xs text-green-200 block mb-1">
                Sasaran
              </label>
              <input
                maxLength={300}
                value={subKegForm.sasaran}
                onChange={(e) =>
                  setSubKegForm((s) => ({ ...s, sasaran: e.target.value }))
                }
                placeholder="Sasaran kegiatan"
                className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-xs text-green-200 block mb-1">
                Indikator
              </label>
              <input
                maxLength={300}
                value={subKegForm.indikator}
                onChange={(e) =>
                  setSubKegForm((s) => ({ ...s, indikator: e.target.value }))
                }
                placeholder="Indikator capaian"
                className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-xs text-green-200 block mb-1">
                Pagu Usulan (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={subKegForm.pagu}
                onChange={(e) =>
                  setSubKegForm((s) => ({ ...s, pagu: e.target.value }))
                }
                placeholder="0"
                className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-xs text-green-200 block mb-1">
                Keterangan
              </label>
              <input
                maxLength={500}
                value={subKegForm.keterangan}
                onChange={(e) =>
                  setSubKegForm((s) => ({ ...s, keterangan: e.target.value }))
                }
                placeholder="Keterangan tambahan (opsional)"
                className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={subKegSubmitting || !subKegForm.nama.trim()}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
            >
              {subKegSubmitting ? "Menyimpan…" : "📤 Ajukan Usulan"}
            </button>
            {subKegResult && (
              <span
                className={`text-xs ${subKegResult.ok ? "text-emerald-300" : "text-red-300"}`}
              >
                {subKegResult.ok
                  ? "✅ Usulan berhasil diajukan."
                  : "❌ Gagal menyimpan. Coba lagi."}
              </span>
            )}
          </div>
        </form>
        {(subKegListLoading || subKegList.length > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-700/40">
            <p className="text-xs font-semibold text-slate-400 mb-2">
              Usulan yang telah diajukan ({subKegList.length})
            </p>
            {subKegListLoading ? (
              <p className="text-xs text-slate-500 animate-pulse">
                Memuat daftar…
              </p>
            ) : (
              <div className="space-y-1.5">
                {subKegList.slice(0, 5).map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 text-xs"
                  >
                    <span className="text-slate-200 truncate max-w-[70%]">
                      {item.nama_sub_kegiatan}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-green-900/40 text-green-300 font-medium flex-shrink-0">
                      {item.status || "diajukan"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </main>
    </DashboardKetersediaanLayout>
  );
}
