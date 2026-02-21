import { useState } from "react";
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
  const [search, setSearch] = useState("");
  const [data] = useState([
    {
      id: 1,
      username: "admin",
      email: "admin@mail.com",
      role: "Admin",
      unit_kerja: "IT",
      is_active: true,
      created_at: "2026-02-20",
    },
    {
      id: 2,
      username: "user",
      email: "user@mail.com",
      role: "User",
      unit_kerja: "Finance",
      is_active: false,
      created_at: "2026-02-19",
    },
  ]);
  const filteredData = data.filter(
    (item) =>
      item.username.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()),
  );

  function getDetailPath(id) {
    return `/module/${moduleId}/detail/${id}`;
  }
  function getEditPath(id) {
    return `/module/${moduleId}/edit/${id}`;
  }

  async function handleDelete(id) {
    try {
      await api.delete(`${endpoint}/${id}`);
      // fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className={`heroicon-${icon || "document-text"}`}>📋</span>
            <h2 className="text-2xl font-display text-ink">{title}</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <input
              type="text"
              placeholder="Cari username/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-ink outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-accentSoft md:w-56"
            />
            <Link
              to={`/module/${moduleId}/create`}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-soft-sm transition hover:bg-blue-700"
            >
              + Tambah User
            </Link>
          </div>
        </div>

        <div className="p-6 pb-0">
          <div className="flex flex-wrap gap-6">
            <Stat label="Total Data" value={`${data.length}`} />
            <Stat
              label="Hasil Filter"
              value={`${filteredData.length}`}
              helper="setelah pencarian"
            />
          </div>
        </div>

        <div className="p-6 pt-4">
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
                  Username
                </TableCell>
                <TableCell
                  as="th"
                  className="text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Email
                </TableCell>
                <TableCell
                  as="th"
                  className="text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Role
                </TableCell>
                <TableCell
                  as="th"
                  className="text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Unit Kerja
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
                    colSpan={8}
                    className="py-10 text-center text-sm text-[#64748b]"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.unit_kerja}</TableCell>
                    <TableCell>
                      <Badge
                        tone={
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.created_at}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={getDetailPath(item.id)}
                        className="text-info hover:text-accentDark mr-3"
                      >
                        👁️
                      </Link>
                      <Link
                        to={getEditPath(item.id)}
                        className="text-emerald-700 hover:text-emerald-800 mr-3"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() =>
                          window.confirm("Hapus data ini?") &&
                          handleDelete(item.id)
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
  );
}
