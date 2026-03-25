import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifyError } from "../../utils/notify";

const JENIS_NASKAH_OPTIONS = [
  "SK",
  "SE",
  "ST",
  "SU",
  "ND",
  "MEMO",
  "BA",
  "LAP",
  "SP",
  "SKET",
  "Lainnya",
];

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  review: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  signed: "bg-indigo-100 text-indigo-700",
  sent: "bg-green-100 text-green-700",
  arsip: "bg-gray-200 text-gray-600",
  batal: "bg-red-100 text-red-600",
};

export default function SuratKeluarPage() {
  const navigate = useNavigate();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterJenis) params.jenis_naskah = filterJenis;
      const res = await api.get("/surat/keluar", { params });
      setSuratList(res.data.data || []);
    } catch (error) {
      notifyError("Gagal memuat daftar surat keluar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterJenis]);

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">📤 Surat Keluar</h1>
        <button
          onClick={() => navigate("/surat/keluar/baru")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          + Buat Surat Keluar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Jenis</option>
          {JENIS_NASKAH_OPTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading && suratList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Memuat data...</div>
      ) : suratList.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>Tidak ada surat keluar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suratList.map((surat) => (
            <div
              key={surat.id}
              onClick={() => navigate(`/surat/keluar/${surat.id}/edit`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                      {surat.jenis_naskah}
                    </span>
                    <span className="font-mono text-sm text-blue-700">
                      {surat.nomor_surat || surat.draft_nomor || "Draft"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[surat.status] || "bg-gray-100"}`}
                    >
                      {surat.status}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 truncate">
                    {surat.perihal}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>📬 {surat.kepada}</span>
                    <span>📅 {surat.tanggal_surat}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
