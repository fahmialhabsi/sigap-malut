console.log("Loaded: DashboardKetersediaan wrapper");
// frontend/src/ui/dashboards/DashboardKetersediaan.jsx
import React, { useState, useEffect } from "react";
import DashboardKetersediaanLayout from "../../layouts/DashboardKetersediaanLayout";
import ketersediaanModules from "../../data/ketersediaanModules";
import api from "../../utils/api";

// Wrapper: re-export layout yang baru sehingga route yang sudah ada tetap bekerja.
// Jika Anda ingin menyimpan implementasi lama (dashboard ringkas), lihat DashboardKetersediaanLegacy.jsx
export default function DashboardKetersediaan(props) {
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

  return (
    <DashboardKetersediaanLayout
      fallbackModules={ketersediaanModules}
      {...props}
    >
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
    </DashboardKetersediaanLayout>
  );
}
