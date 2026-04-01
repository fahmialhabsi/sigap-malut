// Tim Saya Panel — Kepala Bidang memantau JF 1 & JF 2
// Kepala Bidang TIDAK BOLEH melihat nilai SKP Pelaksana (PP 30/2019)
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const STATUS_CONFIG = {
  in_progress: { label: "🔄 In Progress", color: "text-blue-600" },
  pending: { label: "⏳ Belum mulai", color: "text-gray-500" },
  done: { label: "✅ Selesai", color: "text-green-600" },
  submitted_to_kabid: { label: "📤 Dikirim ke Kabid", color: "text-amber-600" },
};

export default function TimSayaPanel({ unitKerja = "Bidang Ketersediaan" }) {
  const [tim, setTim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [form, setForm] = useState({ judul: "", deskripsi: "", assigned_to: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const uk = unitKerja.toLowerCase();
  const endpoint = uk.includes("distribusi")
    ? "/api/kabid-distribusi/tim"
    : uk.includes("konsumsi")
      ? "/api/kabid-konsumsi/tim"
      : "/api/kabid-ketersediaan/tim";

  const assignEndpoint = uk.includes("distribusi")
    ? "/api/kabid-distribusi/tugas"
    : uk.includes("konsumsi")
      ? "/api/kabid-konsumsi/tugas"
      : "/api/kabid-ketersediaan/tugas";

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setTim(res.data?.data ?? null))
      .catch(() => setTim(null))
      .finally(() => setLoading(false));
  }, [endpoint]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.assigned_to.trim()) return;
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await api.post(assignEndpoint, form);
      setSubmitMsg("✅ Tugas berhasil diberikan.");
      setForm({ judul: "", deskripsi: "", assigned_to: "", deadline: "" });
      setShowAssignForm(false);
    } catch {
      setSubmitMsg("❌ Gagal memberikan tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          👥 Tim Saya — {unitKerja}
        </h2>
        <button
          onClick={() => setShowAssignForm((s) => !s)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
        >
          + Assign Tugas
        </button>
      </div>

      {/* Form Assign Tugas */}
      {showAssignForm && (
        <form onSubmit={handleAssign} className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
          <p className="text-xs font-semibold text-indigo-700 mb-2">Assign Tugas ke JF</p>
          <input
            required
            placeholder="Judul tugas *"
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          />
          <input
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              placeholder="ID / nama JF *"
              value={form.assigned_to}
              onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
            >
              {submitting ? "Menyimpan…" : "Assign Tugas"}
            </button>
            {submitMsg && <span className="text-xs text-gray-600">{submitMsg}</span>}
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat data tim…</p>
      ) : !tim ? (
        <p className="text-sm text-gray-400 italic">Data tim belum tersedia.</p>
      ) : (
        <div className="space-y-4">
          {(tim.tim_jf ?? []).map((jf, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{jf.role}</p>
                  <p className="text-xs text-gray-500">{jf.jabatan}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {jf.tugas_aktif ?? 0} tugas aktif
                </span>
              </div>
              {jf.tugas && jf.tugas.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {jf.tugas.map((t, j) => {
                    const sc = STATUS_CONFIG[t.status] ?? { label: t.status, color: "text-gray-500" };
                    return (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 truncate max-w-[70%]">{t.judul}</span>
                        <span className={sc.color}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Catatan Privasi:</span> {tim.catatan_privasi || "Kepala Bidang tidak dapat melihat nilai SKP Pelaksana (PP 30/2019)."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
