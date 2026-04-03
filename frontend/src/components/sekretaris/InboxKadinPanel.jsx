import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function priorityLabel(p) {
  const n = Number(p);
  if (n === 1) return { text: "Mendesak", cls: "bg-red-50 text-red-700 border-red-200" };
  if (n === 2) return { text: "Tinggi", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (n === 4) return { text: "Rendah", cls: "bg-slate-50 text-slate-600 border-slate-200" };
  return { text: "Normal", cls: "bg-blue-50 text-blue-700 border-blue-200" };
}

function statusLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "assigned") return { text: "DITERBITKAN", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (v === "accepted") return { text: "DIBACA", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (v === "in_progress") return { text: "DIPROSES", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (v === "closed") return { text: "SELESAI", cls: "bg-slate-50 text-slate-700 border-slate-200" };
  return { text: s || "—", cls: "bg-slate-50 text-slate-700 border-slate-200" };
}

export default function InboxKadinPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("open"); // open | all | assigned | accepted
  const [acting, setActing] = useState({});

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "open") return rows.filter((r) => ["assigned", "accepted", "in_progress"].includes(String(r.status || "").toLowerCase()));
    return rows.filter((r) => String(r.status || "").toLowerCase() === filter);
  }, [rows, filter]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sekretaris/inbox-kadin", { params: { limit: 50 } });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const konfirmasi = async (id) => {
    setActing((p) => ({ ...p, [id]: true }));
    try {
      await api.post(`/sekretaris/inbox-kadin/${id}/konfirmasi`);
      await fetchInbox();
    } finally {
      setActing((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">
            📥 Inbox Kepala Dinas & Bawahan
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Perintah dari Kepala Dinas dan koordinasi dari bawahan yang wajib
            ditindaklanjuti Sekretaris.
          </p>
        </div>
        <button
          onClick={fetchInbox}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
        >
          ↺ Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "open", label: "Terbuka" },
          { id: "assigned", label: "Diterbitkan" },
          { id: "accepted", label: "Dibaca" },
          { id: "all", label: "Semua" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              filter === f.id
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-8 text-center animate-pulse">Memuat inbox…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">Tidak ada perintah.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Judul</th>
                <th className="px-3 py-2 text-left">Prioritas</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Deadline</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const pr = priorityLabel(t.priority);
                const st = statusLabel(t.status);
                const due = t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID") : "—";
                const canConfirm = String(t.status || "").toLowerCase() === "assigned";
                return (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-gray-800">{t.title || "—"}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{t.description || ""}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-xs ${pr.cls}`}>{pr.text}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-xs ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{due}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        disabled={!canConfirm || acting[t.id]}
                        onClick={() => konfirmasi(t.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold"
                      >
                        {acting[t.id] ? "Memproses…" : "Konfirmasi Terima"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-3">
        Catatan: fitur Distribusi ke bawahan & Lapor selesai akan diaktifkan setelah endpoint turunan task selesai.
      </p>
    </div>
  );
}

