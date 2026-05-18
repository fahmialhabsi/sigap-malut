import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { notifyError } from "../../utils/notify";

export default function M029ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const renjaFilter = searchParams.get("renja_id") || "";

  const [rows, setRows] = useState([]);
  const [renjaList, setRenjaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await api.get("/renja", { params: { limit: 500 } });
        const data = res.data?.data || [];
        if (ok) setRenjaList(Array.isArray(data) ? data : []);
      } catch {
        if (ok) setRenjaList([]);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { include_renja: 1 };
      if (renjaFilter) params.renja_id = renjaFilter;
      const res = await api.get("/rkpd", { params });
      const data = res.data?.data || res.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError(e?.response?.data?.message || "Gagal memuat RKPD");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [renjaFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) =>
        String(b.tahun || "").localeCompare(String(a.tahun || ""), undefined, {
          numeric: true,
        }),
      ),
    [rows],
  );

  const onRenjaChange = (e) => {
    const v = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (v) next.set("renja_id", v);
    else next.delete("renja_id");
    setSearchParams(next);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Memuat RKPD…</div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <span>🏛</span> RKPD
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data tertaut ke Renja melalui <code className="text-slate-600">renja_id</code>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-col text-xs font-medium text-slate-600 gap-1">
              Filter Renja
              <select
                value={renjaFilter}
                onChange={onRenjaChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[200px] bg-white"
              >
                <option value="">— Semua —</option>
                {renjaList.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    [{r.tahun}] {r.judul || r.program || `ID ${r.id}`}
                  </option>
                ))}
              </select>
            </label>
            <Link
              to={
                renjaFilter
                  ? `/module/m029/create?renja_id=${renjaFilter}`
                  : "/module/m029/create"
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 self-end"
            >
              + Tambah RKPD
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Sub kegiatan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Renja induk
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Pagu
                </th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-xs uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{r.tahun}</td>
                  <td className="px-4 py-3 max-w-[240px] truncate">
                    {r.nama_sub_kegiatan}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">
                    {r.renja?.judul || (r.renja_id ? `#${r.renja_id}` : "—")}
                  </td>
                  <td className="px-4 py-3">{r.pagu != null ? String(r.pagu) : "—"}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        to={`/module/m029/view/${r.id}`}
                        className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium"
                      >
                        Lihat
                      </Link>
                      <Link
                        to={`/module/m029/edit/${r.id}`}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada data RKPD
              {renjaFilter ? " untuk Renja yang dipilih." : "."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
