import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

export default function FormInputAdminTU() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ringkas: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const fetchRiwayat = () => {
    setLoadingRows(true);
    api
      .get("/api/pelaksana/uptd/tu/admin/riwayat", { params: { limit: 8 } })
      .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setRows([]))
      .finally(() => setLoadingRows(false));
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      notifyError("Judul wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/pelaksana/uptd/tu/admin", form);
      notifySuccess("Terkirim ke Kasubag TU (UPTD).");
      setForm({ title: "", description: "", ringkas: "" });
      fetchRiwayat();
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal mengirim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-cyan-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">🗂️ Form Admin TU UPTD</h2>
        <span className="text-xs bg-cyan-50 border border-cyan-200 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
          Submit ke Kasubag TU (wajib)
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Untuk berkas administrasi, rekap, permintaan jadwal, dan kebutuhan TU. Anda tidak
        bisa bypass ke jalur teknis.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Judul</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Contoh: Rekap surat masuk bulan ini"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Ringkas (opsional)</label>
          <input
            value={form.ringkas}
            onChange={(e) => setForm((f) => ({ ...f, ringkas: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="1 kalimat ringkas"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Deskripsi (opsional)</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={3}
            placeholder="Detail kebutuhan/permintaan…"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-semibold"
        >
          {submitting ? "Mengirim…" : "Kirim ke Kasubag TU"}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-sm">🕒 Riwayat kirim (TU)</h3>
          <button
            type="button"
            onClick={fetchRiwayat}
            className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Refresh
          </button>
        </div>
        {loadingRows ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {r.title || `Tugas #${r.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.ringkas ? `Ringkas: ${r.ringkas} · ` : ""}
                      Tgl: {r.created_at ? String(r.created_at).slice(0, 10) : "—"}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                    {r.status || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

