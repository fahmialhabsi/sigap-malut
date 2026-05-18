import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { notifyError } from "../../utils/notify";

export default function M028ListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/renja", { params: { include_rkpd: 1 } });
      const data = res.data?.data || res.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError(e?.response?.data?.message || "Gagal memuat Renja");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        String(b.tahun || "").localeCompare(String(a.tahun || ""), undefined, {
          numeric: true,
        }),
      ),
    [rows],
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Memuat Renja…</div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <span>📋</span> Renja (Rencana Kerja)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/module/m028/create"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Tambah Renja
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase w-10" />
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Judul
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Program / Kegiatan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  RKPD
                </th>
                <th className="px-4 py-3 text-right font-semibold text-xs uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((r) => {
                const rk = Array.isArray(r.rkpds) ? r.rkpds : [];
                const open = expanded.has(r.id);
                return (
                  <React.Fragment key={r.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-800 text-xs px-1"
                          onClick={() => toggle(r.id)}
                          aria-expanded={open}
                          title="Detail & RKPD terkait"
                        >
                          {open ? "▼" : "▶"}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.tahun}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-[220px] truncate">
                        {r.judul}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[260px] truncate">
                        {[r.program, r.kegiatan].filter(Boolean).join(" — ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{rk.length}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Link
                            to={`/module/m028/view/${r.id}`}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium"
                          >
                            Detail
                          </Link>
                          <Link
                            to={`/module/m029?renja_id=${r.id}`}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium"
                          >
                            Lihat RKPD
                          </Link>
                          <Link
                            to={`/module/m029/create?renja_id=${r.id}`}
                            className="px-2 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-medium"
                          >
                            Tambah RKPD
                          </Link>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-6 py-4 text-xs text-slate-600">
                          <div className="grid md:grid-cols-2 gap-3 mb-3">
                            <p>
                              <span className="font-semibold text-slate-700">
                                Perangkat daerah:
                              </span>{" "}
                              {r.perangkat_daerah || "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Indikator:</span>{" "}
                              {r.indikator || "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Target:</span>{" "}
                              {r.target || "—"}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Pagu:</span>{" "}
                              {r.pagu != null ? String(r.pagu) : "—"}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-700 mb-2">
                            RKPD terkait ({rk.length})
                          </p>
                          {rk.length === 0 ? (
                            <p className="italic text-slate-400">Belum ada RKPD yang tertaut.</p>
                          ) : (
                            <ul className="space-y-1 list-disc pl-4">
                              {rk.map((x) => (
                                <li key={x.id}>
                                  <Link
                                    className="text-blue-700 hover:underline"
                                    to={`/module/m029/view/${x.id}`}
                                  >
                                    {x.nama_sub_kegiatan}
                                  </Link>
                                  {x.pagu != null && (
                                    <span className="text-slate-500">
                                      {" "}
                                      — pagu {String(x.pagu)}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
