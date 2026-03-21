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
  // Validasi agar tidak render HTML fallback/error dari Vite
  // Fallback data per modul, agar tidak render data user generic atau HTML error
  const fallbackData =
    moduleId === "sa01"
      ? [
          {
            id: 1,
            indikator: "Kepatuhan Laporan Harian",
            nilai: 100,
            target: 100,
            status: "Tercapai",
          },
          {
            id: 2,
            indikator: "Bypass Terdeteksi",
            nilai: 0,
            target: 0,
            status: "Aman",
          },
          {
            id: 3,
            indikator: "Validasi Data",
            nilai: 99,
            target: 100,
            status: "Valid",
          },
        ]
      : [
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
        ];
  const [data, setData] = useState(fallbackData);

  // Jika data/error response berupa HTML (misal: fallback Vite), tampilkan error friendly
  const isHtmlError = (arr) => {
    if (!Array.isArray(arr)) return false;
    if (arr.length === 0) return false;
    // Cek jika properti/prototype string mengandung tag HTML
    return (
      typeof arr[0] === "string" &&
      (arr[0].includes("<!doctype html") || arr[0].includes("<html"))
    );
  };

  if (isHtmlError(data)) {
    return (
      <div className="p-8 text-center text-danger">
        <h2 className="text-2xl font-bold mb-4">
          Terjadi Error pada Dashboard Modul
        </h2>
        <p>
          Response backend berupa HTML, kemungkinan backend tidak berjalan atau
          endpoint salah.
        </p>
        <pre className="bg-slate-100 text-xs p-4 mt-4 rounded overflow-x-auto max-w-xl mx-auto">
          {data[0]}
        </pre>
      </div>
    );
  }
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
      // Tambahan: KPI, Alert, Audit, AI, Feedback, Export, Analytics
      // Mockup KPI
      const kpi = {
        compliance: 0.94,
        bypass_count: 3,
        avg_approval_time: 12,
        kgb_alerts: 5,
        komoditas_consistency: 1.0,
        inflasi: 2.35,
      };
      // Mockup Alert
      const alerts = [
        {
          id: "a1",
          severity: "critical",
          title: "KGB Terlambat: Siti",
          summary: "Terlewat 59 hari",
        },
        {
          id: "a2",
          severity: "warning",
          title: "Bypass detected",
          summary: "Bendahara submit SPJ langsung ke Kadis",
        },
      ];
      // Mockup Audit
      const auditLog = [
        {
          id: 1,
          action: "approve",
          user: "sekretaris",
          timestamp: "2026-02-19T10:00:00Z",
          record: "SPJ #123",
        },
        {
          id: 2,
          action: "submit",
          user: "bendahara",
          timestamp: "2026-02-18T09:00:00Z",
          record: "SPJ #124",
        },
      ];
      // Mockup AI Recommendation
      const aiRecommendation = {
        analysis: "Inflasi naik 0.25 poin ...",
        recommendations: [
          {
            id: "r1",
            title: "Operasi Pasar Beras",
            impact_est: "-0.3 poin",
            cost_est: "Rp X",
            actions: ["Request BULOG 50 ton", "Schedule 3 pasar"],
          },
        ],
      };
      // Mockup Feedback
      const feedback = [
        {
          id: "f1",
          user: "masyarakat",
          message: "Harga beras naik di pasar A",
          status: "open",
        },
      ];
      // Export/report handler (mock)
      function handleExport(type) {
        alert(`Export ${type} berhasil (mock)`);
      }
      // Self-service analytics builder (mock)
      function handleAnalyticsBuilder() {
        alert("Analytics builder dibuka (mock)");
      }
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
