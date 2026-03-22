import React, { useState, useEffect, useCallback } from "react";
import DashboardKeuanganLayout from "../../layouts/DashboardKeuanganLayout";
import api from "../../utils/api";
import useAuthStore from "../../stores/authStore";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/notify";

const ALLOWED_ROLES = [
  "super_admin",
  "sekretaris",
  "bendahara",
  "kepala_dinas",
];
const roleIdToName = {
  1: "super_admin",
  2: "kepala_dinas",
  3: "sekretaris",
  4: "bendahara",
};

function normalizeRole(user) {
  return (
    user?.roleName?.toLowerCase() ||
    user?.role?.toLowerCase() ||
    roleIdToName?.[user?.role_id]?.toLowerCase() ||
    null
  );
}

function AccessDenied() {
  return (
    <DashboardKeuanganLayout>
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <div className="text-5xl mb-3">🔒</div>
        <div className="font-semibold text-lg">Akses Ditolak</div>
        <div className="text-sm mt-1">
          Anda tidak memiliki izin melihat halaman ini.
        </div>
      </div>
    </DashboardKeuanganLayout>
  );
}

// ── SPJ STEPPER ──────────────────────────────────────────────────────────────
const SPJ_STEPS = ["Submit", "Verifikasi", "Approve", "Disburse"];
function SPJStepper({ currentStep }) {
  const idx = SPJ_STEPS.indexOf(currentStep);
  return (
    <div className="flex items-center gap-0">
      {SPJ_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < idx
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : i === idx
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 ${
                i <= idx ? "text-amber-700 font-medium" : "text-slate-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < SPJ_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 mb-5 ${
                i < idx ? "bg-emerald-400" : "bg-slate-200"
              }`}
              style={{ minWidth: 32 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── EXPANDABLE TRANSACTION ROW ────────────────────────────────────────────────
function TransactionRow({ item, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    Submit: "bg-slate-100 text-slate-600",
    Verifikasi: "bg-blue-100 text-blue-700",
    Approve: "bg-emerald-100 text-emerald-700",
    Disburse: "bg-purple-100 text-purple-700",
    Ditolak: "bg-red-100 text-red-700",
  };
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-amber-50 transition"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-sm font-mono text-slate-600">
          {item.nomor}
        </td>
        <td className="px-4 py-3 text-sm">{item.uraian}</td>
        <td className="px-4 py-3 text-sm">{item.asn}</td>
        <td className="px-4 py-3 text-sm text-right">
          {item.jumlah.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          })}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-slate-100 text-slate-600"}`}
          >
            {item.status}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-400">{item.tanggal}</td>
        <td className="px-4 py-3 text-right">
          <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td
            colSpan={7}
            className="bg-amber-50 px-6 py-4 border-b border-amber-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Receipt Image */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  📎 Bukti Pembayaran
                </div>
                {item.buktiUrl ? (
                  <img
                    src={item.buktiUrl}
                    alt="bukti"
                    className="max-h-36 rounded-lg border border-slate-200 object-contain bg-white"
                  />
                ) : (
                  <div className="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300">
                    Belum ada foto bukti
                  </div>
                )}
              </div>
              {/* Detail Info */}
              <div className="flex flex-col gap-1 text-sm">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  📑 Detail Transaksi
                </div>
                <div>
                  <span className="text-slate-500">Kode DPA/RKA:</span>{" "}
                  <span className="font-mono font-medium">{item.kodeDPA}</span>
                </div>
                <div>
                  <span className="text-slate-500">Unit Kerja:</span>{" "}
                  {item.unitKerja}
                </div>
                <div>
                  <span className="text-slate-500">Kegiatan:</span>{" "}
                  {item.kegiatan}
                </div>
                <div>
                  <span className="text-slate-500">Sub Kegiatan:</span>{" "}
                  {item.subKegiatan}
                </div>
                <div>
                  <span className="text-slate-500">ASN Pengaju:</span>{" "}
                  {item.asn}
                </div>
              </div>
              {/* Stepper + Actions */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-slate-600 mb-1">
                  🔄 Status SPJ
                </div>
                <SPJStepper currentStep={item.status} />
                {(item.status === "Submit" || item.status === "Verifikasi") && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(item);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(item);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── OCR UPLOAD PANEL ──────────────────────────────────────────────────────────
function OCRUploadPanel({ onClose }) {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setScanning(true);
    // Simulate OCR extraction (2 second delay)
    setTimeout(() => {
      setSuggestion({
        jumlah: 1_250_000,
        tanggal: new Date().toLocaleDateString("id-ID"),
        keterangan: "Biaya perjalanan dinas luar kota",
        vendor: "Hotel Amara Ternate",
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-slate-800">
            📸 Scan Bukti Pembayaran
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="w-full text-sm mb-4"
        />
        {scanning && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 animate-pulse">
            <span>🔍</span> Memindai dokumen...
          </div>
        )}
        {suggestion && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="text-xs font-semibold text-amber-800 mb-2">
              ✨ Hasil OCR — Harap konfirmasi:
            </div>
            <div className="space-y-2">
              {Object.entries({
                Jumlah: `Rp ${suggestion.jumlah.toLocaleString("id-ID")}`,
                Tanggal: suggestion.tanggal,
                Keterangan: suggestion.keterangan,
                Vendor: suggestion.vendor,
              }).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-sm">
                  <span className="text-slate-500 w-24">{k}:</span>
                  <input
                    defaultValue={v}
                    className="flex-1 border border-slate-200 rounded px-2 py-0.5 text-slate-700"
                  />
                </div>
              ))}
            </div>
            <button
              className="mt-3 w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition"
              onClick={() => {
                notifySuccess("Data OCR dikonfirmasi");
                onClose();
              }}
            >
              Konfirmasi &amp; Submit SPJ
            </button>
          </div>
        )}
        {!scanning && !suggestion && (
          <div className="text-xs text-slate-400 text-center py-4">
            Upload gambar untuk mengaktifkan OCR otomatis
          </div>
        )}
      </div>
    </div>
  );
}

// ── DUMMY DATA ────────────────────────────────────────────────────────────────
const DUMMY_SPJ = [
  {
    id: 1,
    nomor: "SPJ-2024-001",
    uraian: "Perjalanan Dinas Luar Kota",
    asn: "Ahmad Yani, S.STP",
    jumlah: 3_500_000,
    status: "Submit",
    tanggal: "2024-07-01",
    kodeDPA: "1.01.01.2.01.01",
    unitKerja: "Sekretariat",
    kegiatan: "Koordinasi Dinas",
    subKegiatan: "Rapat Koordinasi Provinsi",
    buktiUrl: null,
  },
  {
    id: 2,
    nomor: "SPJ-2024-002",
    uraian: "Pengadaan ATK Kantor",
    asn: "Siti Rahayu, S.E.",
    jumlah: 1_250_000,
    status: "Verifikasi",
    tanggal: "2024-07-03",
    kodeDPA: "1.01.01.2.02.01",
    unitKerja: "Bid. Ketersediaan",
    kegiatan: "Pengadaan Rutin",
    subKegiatan: "ATK & Perlengkapan",
    buktiUrl: null,
  },
  {
    id: 3,
    nomor: "SPJ-2024-003",
    uraian: "Biaya Upah Tenaga Harian",
    asn: "Budi Santoso",
    jumlah: 2_800_000,
    status: "Approve",
    tanggal: "2024-07-05",
    kodeDPA: "1.01.01.2.03.01",
    unitKerja: "Bid. Distribusi",
    kegiatan: "Operasional Lapangan",
    subKegiatan: "Tenaga Harian Lepas",
    buktiUrl: null,
  },
  {
    id: 4,
    nomor: "SPJ-2024-004",
    uraian: "Perbaikan Kendaraan Dinas",
    asn: "Hasan Basri",
    jumlah: 4_200_000,
    status: "Disburse",
    tanggal: "2024-07-08",
    kodeDPA: "1.01.01.2.04.01",
    unitKerja: "UPTD Ternate",
    kegiatan: "Pemeliharaan Aset",
    subKegiatan: "Kendaraan Roda 4",
    buktiUrl: null,
  },
  {
    id: 5,
    nomor: "SPJ-2024-005",
    uraian: "Konsumsi Rapat Koordinasi",
    asn: "Dewi Lestari, S.E.",
    jumlah: 875_000,
    status: "Ditolak",
    tanggal: "2024-07-10",
    kodeDPA: "1.01.01.2.05.01",
    unitKerja: "Sekretariat",
    kegiatan: "Rapat Internal",
    subKegiatan: "Konsumsi Rapat",
    buktiUrl: null,
  },
];

const DUMMY_SUMMARY = {
  totalTransaksi: 125_600_000,
  spjPending: 12,
  rejectRate: 8.3,
  avgVerifyHours: 18.4,
  serapanAnggaran: 67.4,
  totalDPA: 1_850_000_000,
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DashboardKeuangan() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRole(user);

  const [summary, setSummary] = useState(DUMMY_SUMMARY);
  const [spjList, setSpjList] = useState(DUMMY_SPJ);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [showOCR, setShowOCR] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, spjRes] = await Promise.all([
        api.get("/keuangan/summary"),
        api.get("/keuangan/spj"),
      ]);
      setSummary(summaryRes.data?.data || DUMMY_SUMMARY);
      setSpjList(spjRes.data?.data || DUMMY_SPJ);
    } catch {
      // use dummy data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user || !ALLOWED_ROLES.includes(roleName)) return <AccessDenied />;

  const STATUS_OPTIONS = [
    "Semua",
    "Submit",
    "Verifikasi",
    "Approve",
    "Disburse",
    "Ditolak",
  ];

  const filteredSPJ = spjList.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === "Semua" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (item) => {
    try {
      await api.patch(`/keuangan/spj/${item.id}/approve`);
      notifySuccess(`SPJ ${item.nomor} disetujui`);
      setSpjList((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? { ...s, status: s.status === "Submit" ? "Verifikasi" : "Approve" }
            : s,
        ),
      );
    } catch {
      // Optimistic fallback
      setSpjList((prev) =>
        prev.map((s) =>
          s.id === item.id
            ? { ...s, status: s.status === "Submit" ? "Verifikasi" : "Approve" }
            : s,
        ),
      );
      notifyWarning("Server offline — status diperbarui lokal");
    }
  };

  const handleReject = async (item) => {
    try {
      await api.patch(`/keuangan/spj/${item.id}/reject`);
      notifySuccess(`SPJ ${item.nomor} ditolak`);
      setSpjList((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: "Ditolak" } : s)),
      );
    } catch {
      setSpjList((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: "Ditolak" } : s)),
      );
      notifyWarning("Server offline — status diperbarui lokal");
    }
  };

  // Serapan anggaran bar
  const serapanPct = summary.serapanAnggaran;

  return (
    <DashboardKeuanganLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Dashboard Keuangan &amp; SPJ
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manajemen Surat Pertanggungjawaban dan Anggaran Dinas
            </p>
          </div>
          <button
            onClick={() => setShowOCR(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition"
          >
            <span>📸</span> Scan Bukti OCR
          </button>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Transaksi Bulan Ini",
              value: `Rp ${(summary.totalTransaksi / 1e6).toFixed(1)}M`,
              icon: "💳",
              color: "from-amber-400 to-amber-600",
            },
            {
              label: "SPJ Menunggu Persetujuan",
              value: summary.spjPending,
              icon: "⏳",
              color: "from-orange-400 to-orange-600",
            },
            {
              label: "Reject Rate",
              value: `${summary.rejectRate}%`,
              icon: "❌",
              color:
                summary.rejectRate > 10
                  ? "from-red-400 to-red-600"
                  : "from-slate-400 to-slate-600",
            },
            {
              label: "Avg Waktu Verifikasi",
              value: `${summary.avgVerifyHours}j`,
              icon: "⏱️",
              color: "from-blue-400 to-blue-600",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-gradient-to-br ${kpi.color} p-4 rounded-2xl text-white shadow`}
            >
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-xs opacity-80 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Serapan Anggaran */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-700">
              📑 Serapan Anggaran DPA
            </div>
            <div className="text-sm text-slate-500">
              Total DPA:{" "}
              <span className="font-bold text-slate-700">
                Rp {(summary.totalDPA / 1e9).toFixed(2)}B
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  serapanPct >= 80
                    ? "bg-emerald-500"
                    : serapanPct >= 50
                      ? "bg-amber-400"
                      : "bg-red-400"
                }`}
                style={{ width: `${serapanPct}%` }}
              />
            </div>
            <div className="font-bold text-lg text-slate-700 w-14 text-right">
              {serapanPct}%
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />{" "}
              ≥80% Baik
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />{" "}
              50-79% Sedang
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full inline-block" />{" "}
              &lt;50% Perlu Perhatian
            </span>
          </div>
        </div>

        {/* SPJ Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="font-semibold text-slate-700 flex-1">
              📄 Daftar SPJ
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Cari nomor / uraian / ASN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={fetchData}
                className="px-3 py-1.5 text-sm bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Nomor SPJ</th>
                  <th className="px-4 py-3">Uraian</th>
                  <th className="px-4 py-3">ASN Pengaju</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredSPJ.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-slate-400 text-sm"
                    >
                      Tidak ada data SPJ ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredSPJ.map((item) => (
                    <TransactionRow
                      key={item.id}
                      item={item}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 text-xs text-slate-400 border-t border-slate-100">
            Klik baris untuk expand detail bukti, kode DPA/RKA, dan aksi
            persetujuan
          </div>
        </div>
      </div>

      {showOCR && <OCRUploadPanel onClose={() => setShowOCR(false)} />}
    </DashboardKeuanganLayout>
  );
}
