import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function FormAnalisaPPH() {
  const [form, setForm] = useState({
    judul: "Analisa Skor PPH",
    jenis: "analisa_pph",
    isi_analisa: "",
    periode: String(new Date().getFullYear()),
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
      setMsg("✅ Draf analisa PPH tersimpan. Siap disubmit ke Kabid setelah lengkap.");
    } catch {
      setMsg("❌ Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const jenisOptions =
    meta?.jenis_tersedia ??
    ["analisa_pph", "analisa_konsumsi", "rekomendasi_diversifikasi"];

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
          placeholder="Periode (tahun)"
        />
      </div>
      <textarea
        required
        rows={9}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder="Analisa gap skor PPH vs target, penyebab, dan rekomendasi program…"
        value={form.isi_analisa}
        onChange={(e) => setForm((f) => ({ ...f, isi_analisa: e.target.value }))}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
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
                "\n\n[Draf bantu] Skor PPH belum mencapai target. Kelompok pangan hewani dan umbi-umbian masih di bawah ideal; perlu intervensi edukasi B2SA dan diversifikasi pangan lokal.",
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

