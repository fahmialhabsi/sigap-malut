// frontend/src/ui/dashboards/DashboardPublik.jsx
// Halaman publik — tidak memerlukan autentikasi
import React, { useEffect, useState } from "react";
import SkipToContent from "../../components/ui/SkipToContent";
import api from "../../utils/api";

// Komponen KPI publik — sederhana dan accessible
function PublikKpiCard({ label, value, unit, icon, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 shadow-sm ${colors[color] || colors.blue}`}
      role="status"
      aria-label={`${label}: ${value} ${unit || ""}`}
    >
      <span className="text-3xl" role="img" aria-label={label}>{icon}</span>
      <span className="text-2xl font-extrabold">{value}</span>
      <span className="text-sm font-semibold">{label}</span>
      {unit && <span className="text-xs opacity-75">{unit}</span>}
    </div>
  );
}

// Komponen tabel harga komoditas
function TabelHarga({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-2" aria-label="Memuat data harga">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data?.length) {
    return <p className="text-gray-400 text-sm">Data harga belum tersedia.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Tabel Harga Komoditas Pangan">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="text-left px-3 py-2 font-semibold text-gray-700">Komoditas</th>
            <th scope="col" className="text-right px-3 py-2 font-semibold text-gray-700">Harga (Rp/kg)</th>
            <th scope="col" className="text-center px-3 py-2 font-semibold text-gray-700">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-800">{row.nama || row.komoditas || "—"}</td>
              <td className="px-3 py-2 text-right font-mono text-gray-700">
                {row.harga != null ? Number(row.harga).toLocaleString("id-ID") : "—"}
              </td>
              <td className="px-3 py-2 text-center">
                {row.trend === "naik" ? <span className="text-red-500" aria-label="Naik">↑</span>
                  : row.trend === "turun" ? <span className="text-green-500" aria-label="Turun">↓</span>
                  : <span className="text-gray-400" aria-label="Stabil">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MODUL_PUBLIK = [
  { id: "P001", name: "Data Produksi Pangan", desc: "Data produksi komoditas pangan strategis seluruh kabupaten/kota di Maluku Utara", icon: "🌾", color: "green" },
  { id: "P002", name: "Harga Pangan Harian", desc: "Pantauan harga komoditas pangan di pasar-pasar Maluku Utara", icon: "🏪", color: "blue" },
  { id: "P003", name: "Inflasi Pangan", desc: "Indeks inflasi komoditas pangan bulanan berdasarkan data BPS dan Dinas Pangan", icon: "📈", color: "amber" },
  { id: "P004", name: "UMKM Pangan Bersertifikat", desc: "Daftar UMKM olahan pangan yang telah memiliki sertifikat PIRT dan MD di Malut", icon: "🏆", color: "red" },
];

export default function DashboardPublik() {
  const [inflasi, setInflasi] = useState(null);
  const [harga, setHarga] = useState([]);
  const [loadingInflasi, setLoadingInflasi] = useState(true);
  const [loadingHarga, setLoadingHarga] = useState(true);

  // Fetch inflasi terbaru (endpoint publik — tidak butuh token)
  useEffect(() => {
    setLoadingInflasi(true);
    api
      .get("/inflasi/latest")
      .then((res) => setInflasi(res.data?.data || res.data || null))
      .catch(() => {
        // Graceful fallback — tetap tampilkan portal
      })
      .finally(() => setLoadingInflasi(false));
  }, []);

  // Fetch harga komoditas terbaru (endpoint publik)
  useEffect(() => {
    setLoadingHarga(true);
    api
      .get("/komoditas/stock")
      .then((res) => {
        const items = res.data?.data || res.data || [];
        setHarga(Array.isArray(items) ? items.slice(0, 12) : []);
      })
      .catch(() => setHarga([]))
      .finally(() => setLoadingHarga(false));
  }, []);

  const kpiCards = [
    {
      label: "Inflasi Pangan",
      value: loadingInflasi ? "…" : (inflasi?.inflasiPangan != null ? `${inflasi.inflasiPangan}%` : (inflasi?.inflasi_persen != null ? `${inflasi.inflasi_persen}%` : "—")),
      unit: inflasi?.periode || "Bulanan",
      icon: "📊",
      color: "amber",
    },
    {
      label: "Komoditas Dipantau",
      value: loadingHarga ? "…" : (harga.length > 0 ? String(harga.length) : "—"),
      unit: "komoditas",
      icon: "🌽",
      color: "green",
    },
    {
      label: "Status Ketahanan",
      value: inflasi?.status_inflasi || "—",
      unit: "berdasarkan data terbaru",
      icon: "🛡️",
      color: "blue",
    },
    {
      label: "Komoditas Tertinggi",
      value: inflasi?.komoditas_tertinggi || "—",
      unit: "harga tertinggi bulan ini",
      icon: "⚠️",
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <SkipToContent />

      <header role="banner" aria-label="Header Portal Data Publik SIGAP Malut"
        className="bg-white border-b border-blue-100 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Logo SIGAP Malut" className="h-10 w-10 object-contain" />
            <div>
              <div className="font-bold text-lg text-blue-800">SIGAP Malut</div>
              <div className="text-xs text-blue-600">Portal Data Publik — Dinas Pangan Provinsi Maluku Utara</div>
            </div>
          </div>
          <a href="/login" className="text-sm text-blue-600 hover:underline font-medium">
            Login Pegawai →
          </a>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-8 space-y-8"
        aria-label="Konten Portal Data Publik">

        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Portal Data Publik Ketahanan Pangan</h1>
          <p className="text-blue-100 leading-relaxed">
            Data terbuka Dinas Pangan Provinsi Maluku Utara — harga pangan, inflasi,
            produksi, dan UMKM tersertifikasi.
          </p>
        </div>

        {/* KPI Publik */}
        <section aria-label="Indikator Ketahanan Pangan" aria-live="polite">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Indikator Ketahanan Pangan Terkini</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpiCards.map((k) => (
              <PublikKpiCard key={k.label} {...k} />
            ))}
          </div>
        </section>

        {/* Tabel Harga */}
        <section aria-label="Harga Komoditas Pangan">
          <div className="bg-white rounded-2xl border border-blue-100 shadow p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              🏪 Harga Komoditas Pangan
              {!loadingHarga && harga.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">({harga.length} komoditas)</span>
              )}
            </h2>
            <TabelHarga data={harga} loading={loadingHarga} />
          </div>
        </section>

        {/* Modul Data Terbuka */}
        <section aria-label="Modul Data Terbuka">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Modul Data Terbuka</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODUL_PUBLIK.map((modul) => (
              <article
                key={modul.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition"
              >
                <span className="text-3xl" role="img" aria-label={modul.name}>{modul.icon}</span>
                <div className="font-semibold text-blue-800">{modul.name}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{modul.desc}</div>
                <div className="text-xs font-mono text-gray-300 mt-auto">ID: {modul.id}</div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer role="contentinfo" className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 mt-8">
        <p>SIGAP Malut — Sistem Informasi Terintegrasi Dinas Pangan Provinsi Maluku Utara</p>
        <p className="mt-1">Data diperbarui secara berkala sesuai laporan bidang terkait.</p>
      </footer>
    </div>
  );
}
