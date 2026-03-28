/**
 * LaporanMendagriPage.jsx
 *
 * Halaman khusus laporan Mendagri di route /dashboard/inflasi/mendagri
 * Sesuai spesifikasi dokumen §7.2 & §13 — PPTX 6 slide dengan template selection,
 * watermark, dan tanda tangan.
 */
import { useState, useEffect, useCallback } from "react";
import DashboardInflasiLayout from "../layouts/DashboardInflasiLayout";
import MendagriPPTXModal from "../components/export/MendagriPPTXModal";
import api from "../utils/api";

const DUMMY_DATA = {
  periode: "Maret 2026",
  inflasi_persen: 2.35,
  status: "on_target",
  top_10: [
    { komoditas: "Beras Premium", perubahan: 3.31, kontribusi: 1.1 },
    { komoditas: "Minyak Goreng", perubahan: 2.74, kontribusi: 0.6 },
    { komoditas: "Daging Ayam", perubahan: 2.12, kontribusi: 0.4 },
    { komoditas: "Cabai Merah", perubahan: 5.4, kontribusi: 0.35 },
    { komoditas: "Telur Ayam", perubahan: 1.9, kontribusi: 0.25 },
    { komoditas: "Gula Pasir", perubahan: 1.5, kontribusi: 0.2 },
    { komoditas: "Bawang Merah", perubahan: 4.2, kontribusi: 0.18 },
    { komoditas: "Tomat", perubahan: 3.8, kontribusi: 0.12 },
    { komoditas: "Tahu", perubahan: 1.2, kontribusi: 0.08 },
    { komoditas: "Tempe", perubahan: 1.1, kontribusi: 0.07 },
  ],
  trend_6bulan: [
    { bulan: "Okt", inflasi: 1.8 },
    { bulan: "Nov", inflasi: 2.1 },
    { bulan: "Des", inflasi: 2.4 },
    { bulan: "Jan", inflasi: 2.2 },
    { bulan: "Feb", inflasi: 2.31 },
    { bulan: "Mar", inflasi: 2.35 },
  ],
  prediksi: {
    bulan_depan: 2.18,
    confidence: 78,
    rekomendasi: [
      {
        id: "r1",
        title: "Operasi Pasar Beras",
        impact_est: "-0.3 poin",
        cost_est: "Rp 500 jt",
        actions: ["Koordinasi Bulog", "Gelar OP di 5 pasar"],
      },
      {
        id: "r2",
        title: "Subsidi Minyak Goreng",
        impact_est: "-0.15 poin",
        cost_est: "Rp 200 jt",
        actions: ["Surat ke Kemendag", "Pantau distribusi"],
      },
    ],
  },
};

const STATUS_CONFIG = {
  on_target: {
    label: "ON TARGET",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  warning: {
    label: "WARNING",
    cls: "bg-amber-100 text-amber-700 border-amber-300",
  },
  alert: { label: "ALERT", cls: "bg-red-100 text-red-700 border-red-300" },
};

function InfoCard({ label, value, sub, accent }) {
  return (
    <div
      className={`rounded-xl border p-4 bg-white ${accent || "border-slate-200"}`}
    >
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function LaporanMendagriPage() {
  const [data, setData] = useState(DUMMY_DATA);
  const [periode, setPeriode] = useState(DUMMY_DATA.periode);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/inflasi/latest");
      const d = res.data?.data;
      if (d && d.inflasiPangan != null) {
        setData({
          inflasi_persen: d.inflasiPangan,
          status:
            d.inflasiPangan > 5
              ? "alert"
              : d.inflasiPangan > 3
                ? "warning"
                : "on_target",
          top_10: (d.contributors || []).map((c) => ({
            komoditas: c.nama,
            perubahan: parseFloat(c.tren ?? 0),
            kontribusi: parseFloat(c.kontribusi ?? 0),
          })),
          trend_6bulan: (d.tren6Bulan || []).map((t) => ({
            bulan: t.bulan,
            inflasi: t.nilai ?? t.inflasi,
          })),
          prediksi: DUMMY_DATA.prediksi,
        });
        if (d.periode) setPeriode(d.periode);
      }
    } catch {
      // gunakan dummy data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusConf = STATUS_CONFIG[data.status] || STATUS_CONFIG.on_target;
  const inflasi = data.inflasi_persen ?? data.inflasiPangan ?? 0;

  return (
    <DashboardInflasiLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <span>Dashboard Inflasi</span>
          <span>›</span>
          <span className="text-slate-600 font-medium">Laporan Mendagri</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          📋 Laporan Rapat Mendagri
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate PPTX resmi 6 slide untuk Rapat Koordinasi Pengendalian
          Inflasi — Kemendagri
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-blue-700">
            Data Aktif: {periode}
          </div>
          <div className="text-xs text-blue-500 mt-0.5">
            Klik "Generate PPTX Mendagri" untuk membuat laporan resmi 6 slide
            dengan template, watermark, dan tanda tangan.
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          🖨️ Generate PPTX Mendagri
        </button>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
          Memuat data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoCard
              label="Inflasi Pangan Periode Ini"
              value={`${Number(inflasi).toFixed(2)}%`}
              sub={periode}
              accent="border-blue-200"
            />
            <InfoCard
              label="Target Nasional"
              value="≤ 3.5%"
              sub="Batas Mendagri"
            />
            <InfoCard
              label="Prediksi Bulan Depan"
              value={`${Number(data.prediksi?.bulan_depan ?? 0).toFixed(2)}%`}
              sub={`Confidence: ${data.prediksi?.confidence ?? "—"}%`}
            />
            <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-500 mb-1">
                Status
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full border text-sm font-bold ${statusConf.cls}`}
              >
                {statusConf.label}
              </span>
            </div>
          </div>

          {/* Top 10 Mini table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">
                Top 10 Kontributor (Pratinjau)
              </h3>
              <span className="text-xs text-slate-400">
                Akan muncul di Slide 3 PPTX
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">#</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Komoditas
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Perubahan (%)
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Kontribusi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data.top_10 || []).slice(0, 10).map((r, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-blue-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-slate-700">
                        {r.komoditas}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {Number(r.perubahan).toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {Number(r.kontribusi).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info kapabilitas */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-700 mb-3">
              Kapabilitas Export PPTX Mendagri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
              {[
                "✅ 6 Slide — Cover, Ringkasan, Top 10, Tren, Prediksi, Penutup",
                "✅ 3 Template — Resmi Biru, Modern Hijau, Minimal Abu",
                "✅ Watermark diagonal — DRAFT / RAHASIA / INTERNAL atau custom",
                "✅ Blok tanda tangan — Nama, Jabatan, NIP, Kota, Tanggal",
                "✅ Tren 6 bulan dalam tabel + kode warna status",
                "✅ Rekomendasi kebijakan + estimasi dampak & biaya",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                🖨️ Buka Generator PPTX
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <MendagriPPTXModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
        periode={periode}
      />
    </DashboardInflasiLayout>
  );
}
