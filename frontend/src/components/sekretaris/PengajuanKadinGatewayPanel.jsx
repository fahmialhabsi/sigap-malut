import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function PengajuanKadinGatewayPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catatan, setCatatan] = useState({});

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/sekretaris/pengajuan-kadin", { params: { limit: 40 } });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal memuat gateway Ka.Dinas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function mulaiReview(id) {
    try {
      await api.post(`/sekretaris/pengajuan-kadin/${id}/mulai-review`);
      toast.success("Status: dalam review Sekretaris");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal memulai review");
    }
  }

  async function teruskan(id) {
    try {
      await api.post(`/sekretaris/pengajuan-kadin/${id}/teruskan-kadin`, {
        catatan_sekretaris: catatan[id] || null,
      });
      toast.success("Diteruskan ke Kepala Dinas");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal meneruskan");
    }
  }

  async function kembalikan(id) {
    const c =
      window.prompt("Catatan wajib untuk pengembalian ke pengaju:", "") || "";
    if (!c.trim()) {
      toast.error("Catatan wajib");
      return;
    }
    try {
      await api.post(`/sekretaris/pengajuan-kadin/${id}/kembalikan`, {
        catatan: c.trim(),
      });
      toast.success("Pengajuan dikembalikan ke pengaju (draft)");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal mengembalikan");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">Gateway — Pengajuan ke Ka.Dinas</h2>
          <p className="text-xs text-gray-500 mt-1">
            Hanya pengajuan yang Anda teruskan di sini yang masuk antrian persetujuan Kepala Dinas.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Memuat…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          Tidak ada pengajuan menunggu gateway.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200/80 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">
                    {p.nomor_pengajuan || `#${p.id}`} — {p.judul}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Jenis: {p.jenis} · Status:{" "}
                    <span className="text-gray-700 font-medium">{p.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === "diajukan_ke_sekretaris" ? (
                    <button
                      type="button"
                      onClick={() => mulaiReview(p.id)}
                      className="px-2 py-1 text-[11px] rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                    >
                      Mulai review
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => teruskan(p.id)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Teruskan ke Ka.Dinas
                  </button>
                  <button
                    type="button"
                    onClick={() => kembalikan(p.id)}
                    className="px-2 py-1 text-[11px] rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    Kembalikan
                  </button>
                </div>
              </div>
              <label className="block mt-2 text-[11px] text-gray-500">
                Catatan Sekretaris (opsional, ikut teruskan)
                <input
                  type="text"
                  value={catatan[p.id] || ""}
                  onChange={(e) =>
                    setCatatan((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  className="mt-1 w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200"
                  placeholder="Ringkasan validasi / disposisi"
                />
              </label>
              {p.isi_pengajuan ? (
                <p className="mt-2 text-[11px] text-gray-600 whitespace-pre-wrap line-clamp-3">
                  {p.isi_pengajuan}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
