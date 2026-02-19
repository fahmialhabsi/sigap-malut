import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Badge from "../ui/Badge";
import Stat from "../ui/Stat";
import Table, {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table/Table";

export default function BaseTable({ endpoint, title, icon, moduleId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(endpoint);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-display text-ink flex items-center gap-2">
              <span className={`heroicon-${icon || "document-text"}`}>📋</span>
              {title}
            </h2>
            <Link
              to={`/module/${moduleId}/create`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft-sm transition hover:bg-accentDark"
            >
              + Tambah Data
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="flex flex-wrap gap-6">
              <Stat label="Total Data" value={`${data.length}`} />
              <Stat
                label="Hasil Filter"
                value={`${filteredData.length}`}
                helper="setelah pencarian"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Cari data..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-ink outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-accentSoft"
              />
            </div>
          </div>

          <div className="mt-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    as="th"
                    className="text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    No
                  </TableCell>
                  <TableCell
                    as="th"
                    className="text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Info
                  </TableCell>
                  <TableCell
                    as="th"
                    className="text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    as="th"
                    className="text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    Tanggal
                  </TableCell>
                  <TableCell
                    as="th"
                    className="text-right text-xs font-semibold uppercase tracking-wider"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan="5"
                      className="py-10 text-center text-sm text-muted"
                    >
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                        <svg
                          viewBox="0 0 120 80"
                          className="h-16 w-24 text-slate-300"
                          fill="none"
                          aria-hidden="true"
                        >
                          <rect
                            x="10"
                            y="16"
                            width="100"
                            height="52"
                            rx="12"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle
                            cx="38"
                            cy="42"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M60 54L74 40L94 58"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="text-sm font-semibold text-ink">
                          Belum ada data
                        </div>
                        <div className="text-xs text-muted">
                          Coba tambah data baru atau ubah pencarian.
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="whitespace-nowrap text-sm text-ink">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-ink">
                        <div className="font-semibold">
                          {item.nama_kegiatan || item.jenis_layanan || "Data"}
                        </div>
                        <div className="text-xs text-muted">
                          {item.penanggung_jawab || item.pelaksana || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          tone={
                            item.status === "selesai"
                              ? "bg-emerald-50 text-emerald-700"
                              : item.status === "proses"
                                ? "bg-amber-50 text-warning"
                                : "bg-slate-100 text-slate-600"
                          }
                        >
                          {item.status || "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/module/${moduleId}/view/${item.id}`}
                          className="text-info hover:text-accentDark mr-3"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/module/${moduleId}/edit/${item.id}`}
                          className="text-emerald-700 hover:text-emerald-800 mr-3"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() =>
                            confirm("Hapus data ini?") && handleDelete(item.id)
                          }
                          className="text-danger hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );

  async function handleDelete(id) {
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  }
}
