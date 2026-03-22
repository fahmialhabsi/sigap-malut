/**
 * DashboardKepegawaian.jsx — Dashboard KGB & Kepegawaian
 *
 * Fitur sesuai dokumen 03-dashboard-uiux.md:
 * - KGB calendar timeline (30 hari ke depan)
 * - KGB tracking table per status (pending/proses/selesai/terlambat)
 * - Workflow timeline per ASN (history dokumen & approval)
 * - Actions: Start KGB Process, Upload SK, Notify
 */
import React, { useState, useEffect, useCallback } from "react";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import DashboardKepegawaianLayout from "../../layouts/DashboardKepegawaianLayout";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const ALLOWED_ROLES = [
  "super_admin",
  "sekretaris",
  "kepala_dinas",
  "kasubbag",
  "kasubbag_kepegawaian",
  "kasubbag_umum",
];

function normalizeRole(user) {
  return (
    user?.roleName?.toLowerCase() ||
    user?.role?.toLowerCase() ||
    roleIdToName?.[user?.role_id]?.toLowerCase() ||
    null
  );
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_KGB = [
  {
    id: "K001",
    nama: "Siti Rahma",
    nip: "197803202005012001",
    jabatan: "Analis Kebijakan",
    unit: "Sekretariat",
    jenis: "KGB Berkala",
    tanggal_jatuh_tempo: "2026-03-25",
    status: "terlambat",
    dokumen: ["SK Terakhir", "Kenaikan Gaji"],
    hari_terlambat: 59,
    timeline: [
      {
        tgl: "2026-01-01",
        aksi: "Input data pegawai",
        user: "Staf Kepegawaian",
      },
      { tgl: "2026-02-01", aksi: "Draft SK dibuat", user: "Kasubbag" },
      { tgl: "2026-03-01", aksi: "Menunggu tanda tangan", user: "Sekretaris" },
    ],
  },
  {
    id: "K002",
    nama: "Ahmad Fauzi",
    nip: "198506102008011003",
    jabatan: "Penyuluh Pertanian",
    unit: "Bidang Ketersediaan",
    jenis: "Kenaikan Pangkat",
    tanggal_jatuh_tempo: "2026-04-01",
    status: "proses",
    dokumen: ["PAK Terakhir", "DP3/SKP"],
    hari_terlambat: 0,
    timeline: [
      { tgl: "2026-02-15", aksi: "Berkas diterima", user: "Staf Kepegawaian" },
      { tgl: "2026-03-01", aksi: "Diverifikasi BKD", user: "BKD Malut" },
    ],
  },
  {
    id: "K003",
    nama: "Dewi Kartika",
    nip: "199201052015012002",
    jabatan: "Pengawas Mutu",
    unit: "UPTD",
    jenis: "KGB Berkala",
    tanggal_jatuh_tempo: "2026-04-15",
    status: "pending",
    dokumen: [],
    hari_terlambat: 0,
    timeline: [],
  },
  {
    id: "K004",
    nama: "Rizky Pratama",
    nip: "198812082010011005",
    jabatan: "Kepala Seksi",
    unit: "Bidang Distribusi",
    jenis: "Kenaikan Pangkat",
    tanggal_jatuh_tempo: "2026-05-01",
    status: "selesai",
    dokumen: ["SK Pangkat IVa"],
    hari_terlambat: 0,
    timeline: [
      { tgl: "2026-01-10", aksi: "Pengajuan berkas", user: "Staf" },
      { tgl: "2026-01-20", aksi: "Disetujui BKD", user: "BKD" },
      { tgl: "2026-02-01", aksi: "SK terbit", user: "Kepala Dinas" },
    ],
  },
  {
    id: "K005",
    nama: "Hani Supriyati",
    nip: "200001052023012001",
    jabatan: "Pelaksana",
    unit: "Sekretariat",
    jenis: "KGB Pertama",
    tanggal_jatuh_tempo: "2026-03-30",
    status: "proses",
    dokumen: ["SK CPNS"],
    hari_terlambat: 0,
    timeline: [
      { tgl: "2026-03-10", aksi: "Berkas diajukan", user: "Staf Kepegawaian" },
    ],
  },
];

const STATUS_CONFIG = {
  terlambat: {
    label: "Terlambat",
    cls: "bg-red-100 text-red-700 border-red-200",
  },
  pending: {
    label: "Pending",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  proses: { label: "Proses", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  selesai: {
    label: "Selesai",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

// ─── Calendar Widget (30 hari ke depan) ───────────────────────────────────────
function KGBCalendar({ records }) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const kgbByDate = {};
  records.forEach((r) => {
    const key = r.tanggal_jatuh_tempo;
    if (!kgbByDate[key]) kgbByDate[key] = [];
    kgbByDate[key].push(r);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <span>📅</span> Kalender KGB — 30 Hari ke Depan
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-slate-400 py-1"
          >
            {d}
          </div>
        ))}
        {/* blank cells for first day alignment */}
        {Array.from({ length: days[0].getDay() }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const events = kgbByDate[key] || [];
          const isToday = key === today.toISOString().slice(0, 10);
          return (
            <div
              key={key}
              className={`relative rounded-lg p-1 min-h-[44px] text-center text-xs transition ${
                isToday
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className={isToday ? "text-white" : "text-slate-700"}>
                {d.getDate()}
              </div>
              {events.length > 0 && (
                <div className="mt-0.5">
                  {events.map((e) => (
                    <div
                      key={e.id}
                      title={`${e.nama} — ${e.jenis}`}
                      className={`rounded text-[9px] px-1 truncate ${
                        e.status === "terlambat"
                          ? "bg-red-200 text-red-700"
                          : "bg-emerald-200 text-emerald-700"
                      }`}
                    >
                      {e.nama.split(" ")[0]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Workflow Timeline per ASN ────────────────────────────────────────────────
function ASNTimeline({ record, onClose }) {
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-emerald-50">
        <div>
          <div className="font-bold text-emerald-800">{record.nama}</div>
          <div className="text-xs text-slate-500">
            {record.jabatan} · {record.unit}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >
          ✕
        </button>
      </div>
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 mb-3">
          TIMELINE PROSES
        </div>
        {record.timeline.length === 0 ? (
          <div className="text-xs text-slate-400 italic">
            Belum ada aktivitas.
          </div>
        ) : (
          <ol className="relative border-l-2 border-emerald-200 space-y-4">
            {record.timeline.map((t, i) => (
              <li key={i} className="ml-4">
                <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                <div className="text-xs font-semibold text-slate-700">
                  {t.aksi}
                </div>
                <div className="text-xs text-slate-400">
                  {t.user} · {t.tgl}
                </div>
              </li>
            ))}
          </ol>
        )}

        {record.dokumen.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              DOKUMEN
            </div>
            {record.dokumen.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-blue-600 mb-1 cursor-pointer hover:underline"
              >
                <span>📎</span> {d}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-2">
          <button
            onClick={() => notifySuccess("Proses KGB dimulai (demo)")}
            className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-semibold hover:bg-emerald-700"
          >
            🚀 Mulai Proses KGB
          </button>
          <button
            onClick={() => notifySuccess("Upload SK (demo)")}
            className="w-full rounded-lg border border-emerald-300 text-emerald-700 py-2 text-sm hover:bg-emerald-50"
          >
            📎 Upload SK
          </button>
          <button
            onClick={() => notifySuccess("Notifikasi WhatsApp terkirim (demo)")}
            className="w-full rounded-lg border border-slate-200 text-slate-600 py-2 text-sm hover:bg-slate-50"
          >
            💬 Kirim Notifikasi WA
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component Utama ─────────────────────────────────────────────────────────
export default function DashboardKepegawaian() {
  const user = useAuthStore((s) => s.user);
  const roleName = normalizeRole(user);

  const [records, setRecords] = useState(DUMMY_KGB);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [selectedASN, setSelectedASN] = useState(null);
  const [searchQ, setSearchQ] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/kepegawaian/kgb");
      if (Array.isArray(res.data?.data)) setRecords(res.data.data);
    } catch {
      // gunakan dummy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user || !ALLOWED_ROLES.includes(roleName)) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-xl text-center">
        <div className="font-bold text-lg mb-2">Akses Ditolak</div>
        <p>Anda tidak memiliki izin untuk mengakses Dashboard Kepegawaian.</p>
      </div>
    );
  }

  const filtered = records.filter((r) => {
    const matchStatus = filterStatus === "semua" || r.status === filterStatus;
    const matchSearch =
      !searchQ ||
      r.nama.toLowerCase().includes(searchQ.toLowerCase()) ||
      r.nip.includes(searchQ);
    return matchStatus && matchSearch;
  });

  const counts = {
    semua: records.length,
    terlambat: records.filter((r) => r.status === "terlambat").length,
    proses: records.filter((r) => r.status === "proses").length,
    pending: records.filter((r) => r.status === "pending").length,
    selesai: records.filter((r) => r.status === "selesai").length,
  };

  return (
    <DashboardKepegawaianLayout>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            🏛️ Dashboard Kepegawaian &amp; KGB
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pemantauan KGB, kenaikan pangkat, dan alur dokumen ASN
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            {loading ? "⏳" : "🔄 Refresh"}
          </button>
          <button
            onClick={() => notifySuccess("Proses KGB baru dimulai (demo)")}
            className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
          >
            + Buat KGB Baru
          </button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() =>
              setFilterStatus(filterStatus === key ? "semua" : key)
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filterStatus === key
                ? `${cfg.cls} ring-2 ring-offset-1`
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div
              className={`text-2xl font-bold ${filterStatus === key ? "" : "text-slate-800"}`}
            >
              {counts[key]}
            </div>
            <div className="text-xs font-medium mt-1">{cfg.label}</div>
          </button>
        ))}
      </div>

      {/* ── Kalender ─────────────────────────────────────────── */}
      <div className="mb-6">
        <KGBCalendar records={records} />
      </div>

      {/* ── Tracking Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-200">
          <span className="font-semibold text-slate-700">
            📋 Tabel Tracking KGB
          </span>
          <input
            type="search"
            placeholder="Cari nama / NIP..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="semua">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Nama / NIP
                </th>
                <th className="px-4 py-3 text-left font-semibold">Jenis</th>
                <th className="px-4 py-3 text-left font-semibold">Unit</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Jatuh Tempo
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const sc = STATUS_CONFIG[r.status];
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {r.nama}
                        </div>
                        <div className="text-xs text-slate-400">{r.nip}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.jenis}</td>
                      <td className="px-4 py-3 text-slate-600">{r.unit}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">
                          {r.tanggal_jatuh_tempo}
                        </div>
                        {r.hari_terlambat > 0 && (
                          <div className="text-xs text-red-600">
                            ⚠️ Terlambat {r.hari_terlambat} hari
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedASN(r)}
                          className="px-3 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium"
                        >
                          Detail / Aksi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ASN Workflow Timeline Drawer ──────────────────────── */}
      {selectedASN && (
        <ASNTimeline
          record={selectedASN}
          onClose={() => setSelectedASN(null)}
        />
      )}
      {selectedASN && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSelectedASN(null)}
        />
      )}
    </DashboardKepegawaianLayout>
  );
}
