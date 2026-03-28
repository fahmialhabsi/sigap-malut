import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import ConfirmModal from "../ui/ConfirmModal";
import { notifySuccess, notifyError } from "../../utils/notify";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/export";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const SKIP_KEYS = [
  "id",
  "created_by",
  "updated_by",
  "deleted_at",
  "is_deleted",
  "__v",
];
const MAX_AUTO_COLS = 6;

/**
 * BaseTable — Tabel data dinamis:
 * - Kolom otomatis dari data API (bukan hardcoded username/email/role)
 * - Fetch real dari endpoint
 * - Pagination client-side
 * - Search lintas semua kolom
 * - Konfirmasi hapus via ConfirmModal React (bukan window.confirm)
 * - Notifikasi toast (bukan window.alert)
 * - Loading skeleton & empty state
 *
 * Props:
 *   endpoint   string  — URL API, misal "/sekretariat/kepegawaian"
 *   title      string  — Judul tabel
 *   moduleId   string  — ID modul untuk routing create/view/edit
 *   columns    array   — (opsional) [{key, label}] override kolom otomatis
 *   addLabel   string  — Label tombol tambah (default: "+ Tambah Data")
 *   icon       string  — Emoji/ikon judul
 */
export default function BaseTable({
  endpoint,
  title,
  icon,
  moduleId,
  columns: columnsProp,
  addLabel,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      const rows = res.data?.data || res.data?.rows || res.data || [];
      setData(Array.isArray(rows) ? rows : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal memuat data dari server";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = columnsProp || deriveColumns(data);

  const filteredData = search.trim()
    ? data.filter((row) =>
        Object.values(row).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : data;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const safeFilename = (ext) =>
    `${(title || "data").replace(/[^a-z0-9]/gi, "_")}.${ext}`;

  const handleExportCSV = () => {
    if (!filteredData.length)
      return notifyError("Tidak ada data untuk diekspor");
    exportToCSV(filteredData, safeFilename("csv"));
  };

  const handleExportExcel = async () => {
    if (!filteredData.length)
      return notifyError("Tidak ada data untuk diekspor");
    setExportLoading(true);
    try {
      await exportToExcel(filteredData, safeFilename("xlsx"), title || "Data");
    } catch {
      notifyError("Gagal mengekspor Excel");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!filteredData.length)
      return notifyError("Tidak ada data untuk diekspor");
    setExportLoading(true);
    try {
      await exportToPDF(
        filteredData,
        safeFilename("pdf"),
        title || "Laporan Data",
      );
    } catch {
      notifyError("Gagal mengekspor PDF");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`${endpoint}/${deleteTarget.id}`);
      notifySuccess("Data berhasil dihapus");
      setData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch (err) {
      notifyError(err?.response?.data?.message || "Gagal menghapus data");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold mb-3">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <span>{icon || "📋"}</span> {title}
          </h2>
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
            <input
              type="search"
              placeholder="Cari data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 md:w-56"
              aria-label="Cari data"
            />
            {/* Export buttons */}
            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Export CSV"
            >
              ⬇ CSV
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportLoading}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              title="Export Excel"
            >
              {exportLoading ? "..." : "⬇ Excel"}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              title="Export PDF"
            >
              {exportLoading ? "..." : "⬇ PDF"}
            </button>
            <Link
              to={`/module/${moduleId}/create`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 text-center"
            >
              {addLabel || "+ Tambah Data"}
            </Link>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-2 text-xs text-slate-500 flex flex-wrap items-center gap-4 border-b border-slate-100">
          <span>
            Total: <strong>{data.length}</strong> data
          </span>
          {search && (
            <span>
              Filter: <strong>{filteredData.length}</strong>
            </span>
          )}
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-slate-200 rounded px-1 py-0.5 text-xs ml-auto"
            aria-label="Baris per halaman"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} baris
              </option>
            ))}
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">
                {search
                  ? "Tidak ada data yang sesuai pencarian"
                  : "Belum ada data"}
              </p>
              {!search && (
                <Link
                  to={`/module/${moduleId}/create`}
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  Tambah data pertama
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider w-10">
                    No
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedData.map((item, idx) => (
                  <tr
                    key={item.id ?? idx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-slate-700 max-w-[200px] truncate"
                      >
                        <CellValue value={item[col.key]} colKey={col.key} />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          to={`/module/${moduleId}/view/${item.id}`}
                          className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium"
                          title="Lihat"
                        >
                          👁 Lihat
                        </Link>
                        <Link
                          to={`/module/${moduleId}/edit/${item.id}`}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                          title="Edit"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: item.id,
                              label:
                                item.nama ||
                                item.judul ||
                                item.nomor ||
                                item.title ||
                                `ID ${item.id}`,
                            })
                          }
                          className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                          title="Hapus"
                        >
                          🗑 Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              ← Sebelumnya
            </button>
            <div className="flex gap-1">
              {getPageNumbers(page, totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-xs font-medium ${p === page ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Konfirmasi Hapus Data"
        message={`Anda akan menghapus: "${deleteTarget?.label}". Data tidak dapat dikembalikan. Lanjutkan?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function deriveColumns(data) {
  if (!data || data.length === 0) return [{ key: "id", label: "ID" }];
  return Object.keys(data[0])
    .filter((k) => !SKIP_KEYS.includes(k))
    .slice(0, MAX_AUTO_COLS)
    .map((k) => ({ key: k, label: keyToLabel(k) }));
}

function keyToLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const half = 3;
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + 6);
  start = Math.max(1, end - 6);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function CellValue({ value, colKey }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-300 text-xs italic">—</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
      >
        {value ? "Ya" : "Tidak"}
      </span>
    );
  }
  if (colKey === "status") {
    const map = {
      aktif: "bg-green-100 text-green-700",
      selesai: "bg-green-100 text-green-700",
      draft: "bg-slate-100 text-slate-600",
      diajukan: "bg-blue-100 text-blue-700",
      disetujui: "bg-emerald-100 text-emerald-700",
      ditolak: "bg-red-100 text-red-700",
      proses: "bg-yellow-100 text-yellow-700",
    };
    const cls =
      map[String(value).toLowerCase()] || "bg-slate-100 text-slate-600";
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {value}
      </span>
    );
  }
  if (colKey?.includes("_at") || colKey?.includes("tanggal")) {
    try {
      const d = new Date(value);
      if (!isNaN(d)) {
        return (
          <span className="text-xs">
            {d.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      }
    } catch {
      /* fallthrough */
    }
  }
  return <span>{String(value)}</span>;
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-8 bg-slate-100 rounded w-32" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-slate-100 rounded w-8" />
              <div className="h-4 bg-slate-100 rounded flex-1" />
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
