import React, { useEffect, useState } from "react";
import api from "../../../services/api";

export default function FormAnalisaInspeksi() {
  const [form, setForm] = useState({
    judul: "Analisa Keamanan Pangan (Inspeksi/Keracunan)",
    jenis: "analisa_inspeksi",
    isi_analisa: "",
    periode: new Date().toISOString().slice(0, 7),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api
      .get("/api/jf-konsumsi/analisa")
      .then((res) => setMeta(res.data?.meta ?? null))
      .catch(() => setMeta(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.isi_analisa.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      await api.post("/api/jf-konsumsi/analisa", form);
      setMsg("✅ Draf analisa inspeksi tersimpan. Siap disubmit ke Kabid setelah lengkap.");
    } catch {
      setMsg("❌ Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const jenisOptions =
    meta?.jenis_tersedia ?? ["analisa_inspeksi", "laporan_bimtek"];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        value={form.judul}
        onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
        placeholder="Judul"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={form.periode}
          onChange={(e) => setForm((f) => ({ ...f, periode: e.target.value }))}
          placeholder="Periode (YYYY-MM)"
        />
      </div>
      <textarea
        required
        rows={9}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder="Ringkasan temuan, risiko, rekomendasi tindak lanjut, kebutuhan koordinasi UPTD/BPOM…"
        value={form.isi_analisa}
        onChange={(e) => setForm((f) => ({ ...f, isi_analisa: e.target.value }))}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
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
                "\n\n[Draf bantu] Ditemukan beberapa lokasi dengan status perlu perbaikan; rekomendasi: pembinaan higiene sanitasi, pengawasan ulang 2 minggu, dan eskalasi uji lab UPTD untuk sampel berisiko.",
            }))
          }
        >
          🤖 Sisipkan contoh draf
        </button>
      </div>
      {msg && <p className="text-xs text-gray-600">{msg}</p>}
    </form>
  );
}

