// Workspace analisa — JF Bidang Ketersediaan (split kiri ringkas data, kanan form analisa)
import React, { useEffect, useState } from "react";
import api from "../../../services/api";

export default function WorkspaceAnalisaKetersediaan() {
  const [form, setForm] = useState({
    judul: "Analisa ketersediaan & kerawanan pangan",
    jenis: "analisa_ketersediaan",
    isi_analisa: "",
    periode: new Date().toISOString().slice(0, 7),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api
      .get("/api/jf-ketersediaan/analisa")
      .then((res) => setMeta(res.data?.meta ?? null))
      .catch(() => setMeta(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.isi_analisa.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      await api.post("/api/jf-ketersediaan/analisa", form);
      setMsg(
        "✅ Draf analisa tersimpan. Setelah lengkap, submit hasil ke Kepala Bidang melalui tugas yang relevan.",
      );
    } catch {
      setMsg("❌ Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const jenisOptions =
    meta?.jenis_tersedia ?? [
      "analisa_ketersediaan",
      "analisa_kerawanan",
      "neraca_pangan",
      "laporan_bimtek",
      "rekomendasi",
    ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">
          🌾 Data terverifikasi (ringkas)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Sumber utama: input Pelaksana (lapangan) → diverifikasi JF → dipakai
          untuk analisa & laporan bidang.
        </p>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>
            • Fokus: produksi, stok gudang, neraca pangan, dan status kerawanan
            per kab/kota.
          </li>
          <li>
            • Jika ada outlier (lonjakan ekstrem), kembalikan data ke Pelaksana
            dengan catatan teknis.
          </li>
          <li>
            • Output yang dikirim ke Kepala Bidang adalah dokumen analisa, bukan
            raw data.
          </li>
        </ul>
        {meta?.jenis_tersedia && (
          <p className="mt-4 text-xs text-teal-700">
            Jenis laporan: {meta.jenis_tersedia.join(", ")}.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">✍️ Form analisa JF</h2>
        <p className="text-xs text-gray-500 mb-3">
          Isi analisa wajib ditulis JF; draf AI (opsional) hanya contoh dan harus
          disunting.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            placeholder="Judul"
          />
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={form.jenis}
            onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))}
          >
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Tuliskan analisa, temuan utama, dan rekomendasi…"
            value={form.isi_analisa}
            onChange={(e) =>
              setForm((f) => ({ ...f, isi_analisa: e.target.value }))
            }
          />
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
            >
              {saving ? "Menyimpan…" : "💾 Simpan draf analisa"}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  isi_analisa:
                    f.isi_analisa +
                    "\n\n[Draf AI — sunting] Ringkasan: stok beras daerah menipis di beberapa kab/kota; rekomendasi: penguatan buffer stock + koordinasi distribusi antarpulau; tindak lanjut: EWS level warning untuk indikator stok & wilayah rawan.",
                }))
              }
            >
              🤖 Sisipkan contoh draf AI
            </button>
          </div>
          {msg && <p className="text-xs text-gray-600">{msg}</p>}
        </form>
      </div>
    </div>
  );
}

