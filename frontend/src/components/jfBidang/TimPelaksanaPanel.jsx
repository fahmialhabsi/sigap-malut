// Panel tim pelaksana (CONFIDENTIAL) — hanya untuk JF yang punya bawahan
import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

export default function TimPelaksanaPanel({ baseUrl = "/api/jf-ketersediaan" }) {
  const [data, setData] = useState({ pelaksana: [], tugas_aktif: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`${baseUrl}/tim`)
      .then((res) => setData(res.data?.data ?? { pelaksana: [], tugas_aktif: [] }))
      .catch(() => setData({ pelaksana: [], tugas_aktif: [] }))
      .finally(() => setLoading(false));
  }, [baseUrl]);

  const stats = useMemo(() => {
    const tasks = Array.isArray(data?.tugas_aktif) ? data.tugas_aktif : [];
    const byStatus = tasks.reduce((acc, t) => {
      const st = t.status || "pending";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
    return { total: tasks.length, byStatus };
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">👥 Tim Pelaksana Saya</h2>
        <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
          🔒 CONFIDENTIAL
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Data tim pelaksana dan penilaian kinerja pelaksana hanya terlihat oleh JF
        penilai langsung (PP 30/2019). Kepala Bidang tidak memiliki akses.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Memuat tim…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
              <div className="text-2xl font-bold text-teal-700">
                {Array.isArray(data?.pelaksana) ? data.pelaksana.length : 0}
              </div>
              <div className="text-xs font-medium text-teal-700">
                Pelaksana
              </div>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <div className="text-2xl font-bold text-indigo-700">
                {stats.total}
              </div>
              <div className="text-xs font-medium text-indigo-700">
                Tugas terpantau
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-2xl font-bold text-amber-700">
                {stats.byStatus.in_progress || 0}
              </div>
              <div className="text-xs font-medium text-amber-700">
                In progress
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-2xl font-bold text-slate-700">
                {stats.byStatus.submitted_to_jf || 0}
              </div>
              <div className="text-xs font-medium text-slate-700">
                Menunggu verif
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">
                Pelaksana
              </h3>
              {Array.isArray(data?.pelaksana) && data.pelaksana.length ? (
                <div className="space-y-2">
                  {data.pelaksana.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {p.nama_lengkap || `User #${p.id}`}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.role || "pelaksana"} · {p.unit_kerja || "—"}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">
                        Aktif
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Belum ada data pelaksana terdaftar di tim ini (akan muncul
                  otomatis setelah ada penugasan).
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">
                Tugas aktif (ringkas)
              </h3>
              {Array.isArray(data?.tugas_aktif) && data.tugas_aktif.length ? (
                <div className="space-y-2">
                  {data.tugas_aktif.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {t.judul || t.title || `Tugas #${t.id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.due_date
                            ? `Deadline: ${new Date(t.due_date).toLocaleDateString("id-ID")}`
                            : "Deadline: —"}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {t.status || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Tidak ada tugas aktif yang terpantau.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

