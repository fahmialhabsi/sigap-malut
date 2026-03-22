import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifyError } from "../../utils/notify";

const STATUS_FILTERS = ["Semua", "masuk", "disposisi", "proses", "selesai", "arsip"];

const STATUS_COLORS = {
  masuk: "bg-blue-100 text-blue-700",
  disposisi: "bg-yellow-100 text-yellow-700",
  proses: "bg-orange-100 text-orange-700",
  selesai: "bg-green-100 text-green-700",
  arsip: "bg-gray-100 text-gray-600",
};

const AI_STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-500",
  processing: "bg-blue-100 text-blue-600 animate-pulse",
  done: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

export default function InboxSuratMasukPage() {
  const navigate = useNavigate();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const fetchSurat = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeFilter !== "Semua" ? { status: activeFilter } : {};
      const res = await api.get("/api/surat/masuk", { params });
      setSuratList(res.data.data || []);
    } catch (error) {
      notifyError("Gagal memuat daftar surat masuk.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchSurat();
    // Auto-refresh setiap 15 detik untuk update ai_status
    const interval = setInterval(fetchSurat, 15000);
    return () => clearInterval(interval);
  }, [fetchSurat]);

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">📨 Surat Masuk</h1>
        <button
          onClick={() => navigate("/surat/masuk/upload")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Upload Surat Masuk
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && suratList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Memuat data...</div>
      ) : suratList.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>Tidak ada surat masuk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suratList.map((surat) => (
            <div
              key={surat.id}
              onClick={() => navigate(`/surat/masuk/${surat.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm font-bold text-blue-700">
                      {surat.nomor_agenda}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[surat.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {surat.status}
                    </span>
                    {surat.ai_status !== "done" && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          AI_STATUS_COLORS[surat.ai_status] || ""
                        }`}
                      >
                        AI: {surat.ai_status}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-800 truncate">{surat.perihal}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>📤 {surat.asal_surat}</span>
                    <span>📱 {surat.media_terima}</span>
                    <span>📅 {surat.tanggal_terima}</span>
                  </div>
                  {surat.ai_routing && (
                    <p className="text-xs text-indigo-600 mt-1">
                      🤖 Routing: {surat.ai_routing}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {surat.status === "disposisi" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/surat/masuk/${surat.id}/disposisi`);
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600"
                    >
                      📨 Disposisi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
