import React, { useEffect, useState } from "react";
import api from "../../../services/api";

export default function FormAnalisaSPPG() {
  const [form, setForm] = useState({
    judul: "Analisa Realisasi SPPG (Bapanas/Kemensos)",
    jenis: "analisa_sppg",
    isi_analisa: "",
    periode: new Date().toISOString().slice(0, 7),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [meta, setMeta] = useState(null);
  const [drafting, setDrafting] = useState(false);

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
      setMsg("✅ Draf analisa SPPG tersimpan. Siap disubmit ke Kabid setelah lengkap.");
    } catch {
      setMsg("❌ Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDraftBapanas = async () => {
    setDrafting(true);
    setMsg("");
    try {
      await api.post("/api/kabid-konsumsi/sppg/generate-laporan-bapanas");
      setMsg("✅ Draft laporan Bapanas disiapkan (mock).");
    } catch {
      setMsg("❌ Gagal menyiapkan draft laporan.");
    } finally {
      setDrafting(false);
    }
  };

  const jenisOptions =
    meta?.jenis_tersedia ?? ["analisa_sppg", "analisa_konsumsi"];

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
        placeholder="Analisa realisasi vs target, hambatan distribusi, dan rekomendasi percepatan…"
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
          disabled={drafting}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
          onClick={handleDraftBapanas}
        >
          {drafting ? "Menyiapkan…" : "📄 Siapkan Draft Laporan Bapanas"}
        </button>
      </div>
      {msg && <p className="text-xs text-gray-600">{msg}</p>}
    </form>
  );
}

