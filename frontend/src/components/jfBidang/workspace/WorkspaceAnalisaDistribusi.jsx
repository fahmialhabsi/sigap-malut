// Workspace analisa inflasi & harga — JF Bidang Distribusi (read kiri, form kanan)
import React, { useState, useEffect } from "react";
import api from "../../../utils/api";

export default function WorkspaceAnalisaDistribusi() {
  const [form, setForm] = useState({
    judul: "Analisa inflasi pangan",
    jenis: "analisa_inflasi",
    isi_analisa: "",
    periode: new Date().toISOString().slice(0, 7),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api
      .get("/api/jf-distribusi/analisa")
      .then((res) => setMeta(res.data?.meta ?? null))
      .catch(() => setMeta(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.isi_analisa.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      await api.post("/api/jf-distribusi/analisa", form);
      setMsg("✅ Draf analisa tersimpan. Siap disubmit ke Kepala Bidang setelah review.");
    } catch {
      setMsg("❌ Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">📊 Data harga & inflasi (ringkas)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Ringkasan dari harga terverifikasi. Detail penuh di dashboard Kepala Bidang & modul D1.
        </p>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Inflasi bulan berjalan mengikuti agregasi harian setelah verifikasi JF.</li>
          <li>• Komoditas penyumbang dihitung dari kontribusi poin terhadap indeks.</li>
          <li>• Anomali (&gt; ±30% median 7 hari) muncul di antrean verifikasi harga.</li>
        </ul>
        {meta?.jenis_tersedia && (
          <p className="mt-4 text-xs text-blue-600">
            Jenis laporan yang didukung: {meta.jenis_tersedia.join(", ")}.
          </p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">✍️ Form analisa inflasi</h2>
        <p className="text-xs text-gray-500 mb-3">
          AI hanya sebagai draf bantu; JF bertanggung jawab atas isi yang dikirim ke Kepala Bidang.
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
            {(meta?.jenis_tersedia ?? ["analisa_inflasi", "analisa_harga", "laporan_pasar"]).map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Analisa penyebab inflasi, tekanan harga, dan rekomendasi intervensi…"
            value={form.isi_analisa}
            onChange={(e) => setForm((f) => ({ ...f, isi_analisa: e.target.value }))}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
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
                    "\n\n[Draf AI — sunting sebelum kirim] Tekanan inflasi terkait volatilitas minyak goreng dan beras; koordinasi CPPD & operasi pasar disarankan.",
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
