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
  proses: "bg-yellow-100 text-yellow-800",
  review: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
  arsip: "bg-gray-200 text-gray-800",
  final: "bg-green-100 text-green-800",
  publish: "bg-emerald-100 text-emerald-800",
  Naik: "bg-red-100 text-red-800",
  Turun: "bg-green-100 text-green-800",
  Stabil: "bg-blue-100 text-blue-800",
};

// Helper functions
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "sek-kep": "Kepegawaian",
    "sek-keu": "Keuangan",
    "sek-ren": "Perencanaan",
    "sek-ast": "Aset",
    "bds-hrg": "Harga Pangan",
    "bds-cpd": "Cadangan Pangan",
    "bds-mon": "Monitoring Distribusi",
    "bds-kbj": "Kebijakan Distribusi",
    "bkt-pgd": "Produksi Pangan",
    "bkt-krw": "Kerawanan Pangan",
    "bkt-fsl": "Fasilitasi Ketersediaan",
    "bkt-kbj": "Kebijakan Ketersediaan",
    "bks-kmn": "Keamanan Pangan",
    "bks-dvr": "Diversifikasi Pangan",
    "bks-bmb": "Bimbingan Masyarakat",
    "bks-kbj": "Kebijakan Konsumsi",
    "upt-mtu": "Mutu Pangan",
    "upt-tkn": "Teknis UPTD",
    "upt-adm": "Administrasi UPTD",
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
    "bds-hrg": [
      { key: "tanggal_pantau", label: "Tanggal", type: "date" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "nama_pasar", label: "Pasar", type: "text" },
      { key: "harga", label: "Harga", type: "currency" },
      { key: "satuan", label: "Satuan", type: "text" },
      { key: "tren_harga", label: "Tren", type: "badge" },
    ],
    "bkt-pgd": [
      { key: "periode", label: "Periode", type: "date" },
      { key: "nama_komoditas", label: "Komoditas", type: "text" },
      { key: "luas_tanam", label: "Luas Tanam (Ha)", type: "number" },
      { key: "luas_panen", label: "Luas Panen (Ha)", type: "number" },
      { key: "produksi_total", label: "Produksi (Ton)", type: "number" },
      { key: "status", label: "Status", type: "badge" },
    ],
  };

  return (
    columnMap[moduleId] || [
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
