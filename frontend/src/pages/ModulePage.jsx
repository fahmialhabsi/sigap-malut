import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

export default function ModulePage() {
  const { moduleId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/${moduleId}`);
      setData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      await api.delete(`/${moduleId}/${id}`);
      fetchData(); // Refresh data
      alert("Data berhasil dihapus");
    } catch (err) {
      alert(
        "Error: " + (err.response?.data?.message || "Gagal menghapus data"),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">❌ {error}</p>
      </div>
    );
  }

  const moduleName = getModuleName(moduleId);
  const columns = getColumns(moduleId);

  return (
    <div>
      {/* Header - HANYA 1 KALI! */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{moduleName}</h2>
          <p className="text-sm text-gray-500">
            Module ID: {moduleId.toUpperCase()}
          </p>
        </div>

        {/* Conditional Create Button */}
        {moduleId === "bkt-pgd" ? (
          <Link
            to={`/module/bkt-pgd/create`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Input Data Produksi
          </Link>
        ) : moduleId === "bds-hrg" ? (
          <Link
            to={`/module/bds-hrg/create`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Input Data Harga
          </Link>
        ) : (
          <Link
            to={`/module/${moduleId}/create`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Tambah Data
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-3xl font-bold text-gray-800">{data.length}</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Belum ada data. Klik tombol "Tambah Data" untuk memulai.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm text-gray-900"
                      >
                        {formatValue(row[col.key], col.type)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link
                          to={`/module/${moduleId}/${row.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          to={`/module/${moduleId}/${row.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Status color mapping
const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  persiapan: "bg-sky-100 text-sky-800",
  berlangsung: "bg-indigo-100 text-indigo-800",
  proses: "bg-yellow-100 text-yellow-800",
  review: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
  arsip: "bg-gray-200 text-gray-800",
  ditolak: "bg-red-100 text-red-800",
  final: "bg-green-100 text-green-800",
  publish: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  finalisasi: "bg-purple-100 text-purple-800",
  disetujui: "bg-emerald-100 text-emerald-800",
  Naik: "bg-red-100 text-red-800",
  Turun: "bg-green-100 text-green-800",
  Stabil: "bg-blue-100 text-blue-800",
  Surplus: "bg-blue-100 text-blue-800",
  Aman: "bg-green-100 text-green-800",
  Menipis: "bg-orange-100 text-orange-800",
  Defisit: "bg-red-100 text-red-800",
  Kritis: "bg-red-100 text-red-800",
  Waspada: "bg-yellow-100 text-yellow-800",
  Rawan: "bg-orange-100 text-orange-800",
  "Sangat Rawan": "bg-red-100 text-red-800",
  "On Target": "bg-green-100 text-green-800",
  Warning: "bg-yellow-100 text-yellow-800",
  Alert: "bg-red-100 text-red-800",
  "Prioritas 1": "bg-red-100 text-red-800",
  "Prioritas 2": "bg-red-100 text-red-800",
  "Prioritas 3": "bg-orange-100 text-orange-800",
  "Prioritas 4": "bg-yellow-100 text-yellow-800",
  "Prioritas 5": "bg-blue-100 text-blue-800",
  "Prioritas 6": "bg-green-100 text-green-800",
};

// Helper functions
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "sek-kep": "Kepegawaian",
    "sek-keu": "Keuangan & Anggaran",
    "sek-rmh": "Rumah Tangga & Umum",
    "sek-ren": "Perencanaan",
    "sek-ast": "Aset & BMD",
    "sek-hum": "Protokol & Kehumasan",
    "sek-kbj": "Kebijakan & Koordinasi",
    "bds-hrg": "Harga Pangan",
    "bds-cpd": "Cadangan Pangan Daerah (CPPD)",
    "bds-mon": "Monitoring Distribusi",
    "bds-kbj": "Kebijakan Distribusi",
    "bds-bmb": "Bimbingan & Pendampingan Distribusi",
    "bds-evl": "Evaluasi Distribusi",
    "bds-lap": "Pelaporan Kinerja Distribusi",
    "bkt-pgd": "Produksi Pangan",
    "bkt-krw": "Kerawanan Pangan",
    "bkt-fsl": "Fasilitasi & Intervensi",
    "bkt-kbj": "Kebijakan & Analisis Ketersediaan",
    "bkt-bmb": "Bimbingan & Pendampingan",
    "bkt-mev": "Monitoring Evaluasi & Pelaporan",
    "bks-kmn": "Keamanan Pangan",
    "bks-dvr": "Diversifikasi Pangan",
    "bks-bmb": "Bimbingan & Pelatihan Konsumsi",
    "bks-kbj": "Kebijakan Konsumsi",
    "bks-evl": "Monitoring Evaluasi Konsumsi",
    "bks-lap": "Laporan Kinerja Konsumsi",
    "upt-mtu": "Mutu Pangan",
    "upt-tkn": "Layanan Teknis UPTD",
    "upt-adm": "Administrasi Umum UPTD",
    "upt-keu": "Keuangan UPTD",
    "upt-kep": "Kepegawaian UPTD",
    "upt-ast": "Aset & Perlengkapan UPTD",
    "upt-ins": "Inspeksi & Pengawasan",
  };
  return names[moduleId] || moduleId.toUpperCase();
}

function getColumns(moduleId) {
  const columnMap = {
    "sek-adm": [
      { key: "nomor_surat", label: "Nomor Surat", type: "text" },
      { key: "jenis_naskah", label: "Jenis", type: "text" },
      { key: "tanggal_surat", label: "Tanggal", type: "date" },
      { key: "pengirim_penerima", label: "Pengirim/Penerima", type: "text" },
      { key: "perihal", label: "Perihal", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "sek-kep": [
      { key: "nip", label: "NIP", type: "text" },
      { key: "nama_asn", label: "Nama ASN", type: "text" },
      {
        key: "jenis_layanan_kepegawaian",
        label: "Jenis Layanan",
        type: "text",
      },
      { key: "nomor_sk", label: "Nomor SK", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "sek-keu": [
      { key: "tahun_anggaran", label: "Tahun", type: "number" },
      {
        key: "jenis_layanan_keuangan",
        label: "Jenis Layanan",
        type: "text",
      },
      { key: "layanan_id", label: "Layanan", type: "text" },
      { key: "pagu_anggaran", label: "Pagu", type: "currency" },
      { key: "realisasi", label: "Realisasi", type: "currency" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "sek-rmh": [
      {
        key: "jenis_layanan_rumah_tangga",
        label: "Jenis Layanan",
        type: "text",
      },
      { key: "nomor_sppd", label: "Nomor SPPD", type: "text" },
      { key: "nama_pegawai", label: "Nama Pegawai", type: "text" },
      { key: "tujuan", label: "Tujuan", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "sek-ast": [
      { key: "nama_aset", label: "Nama Aset", type: "text" },
      { key: "kategori_aset", label: "Kategori", type: "text" },
      { key: "kondisi", label: "Kondisi", type: "badge" },
      { key: "status_aset", label: "Status Aset", type: "badge" },
      { key: "nilai_buku", label: "Nilai Buku", type: "currency" },
    ],
    "sek-hum": [
      { key: "tanggal_acara", label: "Tanggal Acara", type: "date" },
      {
        key: "jenis_layanan_humas",
        label: "Jenis Layanan",
        type: "text",
      },
      { key: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      { key: "tempat", label: "Tempat", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "sek-kbj": [
      { key: "tahun", label: "Tahun", type: "number" },
      {
        key: "jenis_layanan_kebijakan",
        label: "Jenis Layanan",
        type: "text",
      },
      { key: "judul", label: "Judul", type: "text" },
      { key: "periode", label: "Periode", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-hrg": [
      { key: "tanggal_pantau", label: "Tanggal", type: "date" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "nama_pasar", label: "Pasar", type: "text" },
      { key: "harga", label: "Harga", type: "currency" },
      { key: "tren_harga", label: "Tren", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-kbj": [
      { key: "tanggal_dokumen", label: "Tanggal Dokumen", type: "date" },
      { key: "jenis_kebijakan", label: "Jenis Kebijakan", type: "text" },
      { key: "judul_kebijakan", label: "Judul", type: "text" },
      { key: "tahun", label: "Tahun", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-mon": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_monitoring", label: "Jenis", type: "text" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "volume_distribusi", label: "Volume", type: "number" },
      { key: "status_stok", label: "Stok", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-cpd": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_layanan_cppd", label: "Jenis", type: "text" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "target_stok", label: "Target Stok", type: "number" },
      { key: "status_stok", label: "Status Stok", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-bmb": [
      { key: "tanggal_kegiatan", label: "Tanggal", type: "date" },
      { key: "jenis_bimbingan", label: "Jenis", type: "text" },
      { key: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      { key: "kabupaten", label: "Kabupaten", type: "text" },
      { key: "jumlah_peserta", label: "Peserta", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-evl": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_evaluasi", label: "Jenis", type: "text" },
      { key: "judul_evaluasi", label: "Judul Evaluasi", type: "text" },
      { key: "persentase_capaian", label: "Capaian (%)", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bds-lap": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "judul_laporan", label: "Judul Laporan", type: "text" },
      { key: "inflasi_pangan", label: "Inflasi (%)", type: "number" },
      { key: "status_inflasi", label: "Status Inflasi", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bkt-pgd": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "luas_tanam", label: "Luas Tanam (Ha)", type: "number" },
      { key: "luas_panen", label: "Luas Panen (Ha)", type: "number" },
      { key: "produksi_total", label: "Produksi (Ton)", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bkt-fsl": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_fasilitasi", label: "Jenis", type: "text" },
      { key: "nama_program", label: "Program", type: "text" },
      { key: "wilayah_sasaran", label: "Wilayah", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bkt-bmb": [
      { key: "tanggal_kegiatan", label: "Tanggal", type: "date" },
      { key: "jenis_bimbingan", label: "Jenis", type: "text" },
      { key: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      { key: "kabupaten", label: "Kabupaten", type: "text" },
      { key: "jumlah_peserta", label: "Peserta", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bkt-kbj": [
      { key: "tanggal_dokumen", label: "Tanggal Dokumen", type: "date" },
      { key: "jenis_kebijakan", label: "Jenis Kebijakan", type: "text" },
      { key: "judul_kebijakan", label: "Judul", type: "text" },
      { key: "tahun", label: "Tahun", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bkt-krw": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_kerawanan", label: "Jenis", type: "text" },
      { key: "kabupaten", label: "Kabupaten", type: "text" },
      { key: "tingkat_kerawanan", label: "Tingkat Kerawanan", type: "badge" },
      { key: "status_ketersediaan", label: "Status", type: "badge" },
    ],
    "bkt-mev": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_monev", label: "Jenis", type: "text" },
      { key: "judul_laporan", label: "Judul Laporan", type: "text" },
      { key: "tahun", label: "Tahun", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-kbj": [
      { key: "tanggal_dokumen", label: "Tanggal Dokumen", type: "date" },
      { key: "jenis_kebijakan", label: "Jenis Kebijakan", type: "text" },
      { key: "judul_kebijakan", label: "Judul Kebijakan", type: "text" },
      { key: "tahun", label: "Tahun", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-dvr": [
      { key: "tanggal_kegiatan", label: "Tanggal", type: "date" },
      { key: "jenis_kegiatan", label: "Jenis Kegiatan", type: "text" },
      { key: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      { key: "kabupaten", label: "Kabupaten", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-kmn": [
      { key: "tanggal_kegiatan", label: "Tanggal", type: "date" },
      {
        key: "jenis_kegiatan_keamanan",
        label: "Jenis Kegiatan",
        type: "text",
      },
      { key: "lokasi", label: "Lokasi", type: "text" },
      { key: "objek_pembinaan", label: "Objek", type: "text" },
      { key: "status_rekomendasi", label: "Rekomendasi", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-bmb": [
      { key: "tanggal_kegiatan", label: "Tanggal", type: "date" },
      { key: "jenis_kegiatan", label: "Jenis Kegiatan", type: "text" },
      { key: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      { key: "jumlah_peserta", label: "Peserta", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-evl": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_evaluasi", label: "Jenis Evaluasi", type: "text" },
      { key: "judul_evaluasi", label: "Judul Evaluasi", type: "text" },
      { key: "persentase_capaian", label: "Capaian (%)", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "bks-lap": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "jenis_laporan", label: "Jenis Laporan", type: "text" },
      { key: "judul_laporan", label: "Judul Laporan", type: "text" },
      { key: "skor_pph", label: "Skor PPH", type: "number" },
      { key: "status_pph", label: "Status PPH", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
  };
  // UPTD Balai Pengawasan columns
  const uptdColumns = {
    "upt-tkn": [
      { key: "jenis_layanan_teknis", label: "Jenis Layanan", type: "text" },
      { key: "tanggal_pengujian", label: "Tanggal", type: "date" },
      { key: "pemohon", label: "Pemohon", type: "text" },
      { key: "jenis_sampel", label: "Jenis Sampel", type: "text" },
      { key: "kesimpulan_uji", label: "Kesimpulan", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "upt-adm": [
      { key: "unit_kerja", label: "Unit Kerja", type: "text" },
      { key: "akses_terbatas", label: "Akses Terbatas", type: "text" },
      { key: "created_at", label: "Dibuat", type: "date" },
    ],
    "upt-keu": [
      { key: "unit_kerja", label: "Unit Kerja", type: "text" },
      { key: "kode_unit", label: "Kode Unit", type: "text" },
      { key: "created_at", label: "Dibuat", type: "date" },
    ],
    "upt-kep": [
      { key: "unit_kerja", label: "Unit Kerja", type: "text" },
      { key: "hak_akses_uptd", label: "Hak Akses", type: "text" },
      { key: "created_at", label: "Dibuat", type: "date" },
    ],
    "upt-ast": [
      { key: "unit_kerja", label: "Unit Kerja", type: "text" },
      { key: "lokasi_unit", label: "Lokasi Unit", type: "text" },
      { key: "kategori_aset_uptd", label: "Kategori Aset", type: "badge" },
      { key: "created_at", label: "Dibuat", type: "date" },
    ],
    "upt-mtu": [
      { key: "jenis_layanan_mutu", label: "Jenis Layanan", type: "text" },
      { key: "tanggal_dokumen", label: "Tanggal", type: "date" },
      { key: "nomor_dokumen_mutu", label: "Nomor Dokumen", type: "text" },
      { key: "judul_dokumen", label: "Judul", type: "text" },
      { key: "status", label: "Status", type: "badge" },
    ],
    "upt-ins": [
      { key: "jenis_layanan_inspeksi", label: "Jenis Layanan", type: "text" },
      { key: "tanggal_inspeksi", label: "Tanggal", type: "date" },
      { key: "lokasi_inspeksi", label: "Lokasi", type: "text" },
      { key: "hasil_inspeksi", label: "Hasil", type: "badge" },
      { key: "status", label: "Status", type: "badge" },
    ],
  };

  return (
    columnMap[moduleId] ||
    uptdColumns[moduleId] || [
      { key: "id", label: "ID", type: "text" },
      { key: "created_at", label: "Dibuat", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ]
  );
}

function formatValue(value, type) {
  if (value === null || value === undefined) return "-";

  switch (type) {
    case "date":
      return new Date(value).toLocaleDateString("id-ID");
    case "currency":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);
    case "number":
      if (value === 0) return "0"; // Tampilkan 0 jika memang 0
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case "badge": {
      const colorClass = statusColors[value] || "bg-gray-100 text-gray-800";
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}
        >
          {value}
        </span>
      );
    }
    default: {
      const str = String(value);
      return str.length > 50 ? str.substring(0, 50) + "..." : str;
    }
  }
}
