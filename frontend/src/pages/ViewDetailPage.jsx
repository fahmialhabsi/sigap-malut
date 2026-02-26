import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

export default function ViewDetailPage() {
  const { moduleId, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/${moduleId}/${id}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [moduleId, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">❌ {error || "Data tidak ditemukan"}</p>
        <Link
          to={`/module/${moduleId}`}
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Kembali ke List
        </Link>
      </div>
    );
  }

  const moduleName = getModuleName(moduleId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Detail {moduleName}
            </h2>
            <p className="text-sm text-gray-500">ID: {id}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/module/${moduleId}/${id}/edit`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ✏️ Edit
            </Link>
            <Link
              to={`/module/${moduleId}`}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(data).map(([key, value]) => {
              // Skip internal fields
              if (["id", "created_by", "updated_by"].includes(key)) return null;

              return (
                <div key={key} className="border-b border-gray-200 pb-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">
                    {formatLabel(key)}
                  </dt>
                  <dd className="text-base text-gray-900">
                    {formatValue(key, value)}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Dibuat: {formatDate(data.created_at)}</span>
            {data.updated_at && (
              <span>Diupdate: {formatDate(data.updated_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "bds-hrg": "Harga Pangan",
    "bkt-pgd": "Produksi Pangan",
  };
  return names[moduleId] || moduleId.toUpperCase();
}

function formatLabel(key) {
  const labels = {
    nomor_surat: "Nomor Surat",
    jenis_naskah: "Jenis Naskah",
    tanggal_surat: "Tanggal Surat",
    pengirim_penerima: "Pengirim/Penerima",
    perihal: "Perihal",
    status: "Status",
    nama_komoditas: "Komoditas",
    nama_pasar: "Nama Pasar",
    tanggal_pantau: "Tanggal Pantau",
    harga: "Harga",
    satuan: "Satuan",
    tren_harga: "Tren Harga",
    periode: "Periode",
    luas_tanam: "Luas Tanam (Ha)",
    luas_panen: "Luas Panen (Ha)",
    produksi: "Produksi (Ton)",
    produktivitas: "Produktivitas",
    keterangan: "Keterangan",
    unit_kerja: "Unit Kerja",
    penanggung_jawab: "Penanggung Jawab",
    pelaksana: "Pelaksana",
  };

  return (
    labels[key] ||
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";

  // Date fields
  if (key.includes("tanggal") || key === "periode" || key.includes("_at")) {
    return formatDate(value);
  }

  // Currency
  if (key === "harga") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  // Number
  if (key.includes("luas_") || key === "produksi" || key === "produktivitas") {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Status badge
  if (key === "status" || key === "tren_harga") {
    const colors = {
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
    const colorClass = colors[value] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${colorClass}`}
      >
        {value}
      </span>
    );
  }

  return String(value);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
