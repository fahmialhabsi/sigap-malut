import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { notifySuccess, notifyError } from "../../utils/notify";

const STATUS_COLORS = {
  masuk: "bg-blue-100 text-blue-700",
  disposisi: "bg-yellow-100 text-yellow-700",
  proses: "bg-orange-100 text-orange-700",
  selesai: "bg-green-100 text-green-700",
  arsip: "bg-gray-100 text-gray-600",
};

export default function DetailSuratMasukPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [konfirmLoading, setKonfirmLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/surat/masuk/${id}`);
      const data = res.data.data;
      setSurat(data);
      setDisposisiList(data.disposisi || []);
    } catch (error) {
      notifyError("Gagal memuat detail surat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // Polling jika AI masih processing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!surat) return;
    if (surat.ai_status === "processing" || surat.ai_status === "pending") {
      const interval = setInterval(fetchDetail, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surat?.ai_status]);

  const handleKonfirmasi = async () => {
    setKonfirmLoading(true);
    try {
      await api.put(`/surat/masuk/${id}/konfirmasi`, {});
      notifySuccess("Surat berhasil dikonfirmasi dan diteruskan ke pimpinan.");
      fetchDetail();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "Gagal mengkonfirmasi surat.",
      );
    } finally {
      setKonfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">Memuat data...</div>
    );
  }

  if (!surat) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Surat tidak ditemukan.</p>
        <button
          onClick={() => navigate("/surat/masuk")}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Kembali ke Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4 pb-10">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/surat/masuk")}
          className="text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Detail Surat Masuk
          </h1>
          <p className="text-sm font-mono text-blue-600">
            {surat.nomor_agenda}
          </p>
        </div>
        <span
          className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[surat.status] || "bg-gray-100"}`}
        >
          {surat.status}
        </span>
      </div>

      {/* AI Status Card */}
      {surat.ai_status === "processing" || surat.ai_status === "pending" ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="animate-spin text-2xl">⏳</div>
          <div>
            <p className="font-medium text-blue-700">
              AI sedang menganalisis surat...
            </p>
            <p className="text-sm text-blue-500">
              Halaman akan diperbarui otomatis
            </p>
          </div>
        </div>
      ) : surat.ai_status === "done" ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
          <h3 className="font-bold text-green-700 mb-2">
            🤖 Hasil Analisis AI
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {surat.ai_klasifikasi && (
              <div>
                <span className="text-gray-500">Klasifikasi:</span>
                <p className="font-medium">{surat.ai_klasifikasi}</p>
              </div>
            )}
            {surat.ai_routing && (
              <div>
                <span className="text-gray-500">Routing:</span>
                <p className="font-medium text-indigo-600">
                  {surat.ai_routing}
                </p>
              </div>
            )}
            {surat.ai_confidence != null && (
              <div>
                <span className="text-gray-500">Confidence:</span>
                <p className="font-medium">
                  {(surat.ai_confidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </div>
      ) : surat.ai_status === "failed" ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm text-red-600">
          ⚠️ Analisis AI gagal. Silakan isi data secara manual.
        </div>
      ) : null}

      {/* Info Surat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <h2 className="font-bold text-gray-700 mb-4">Informasi Surat</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="Nomor Agenda" value={surat.nomor_agenda} mono />
          <InfoRow label="Nomor Surat" value={surat.nomor_surat || "-"} />
          <InfoRow label="Tanggal Surat" value={surat.tanggal_surat || "-"} />
          <InfoRow label="Tanggal Terima" value={surat.tanggal_terima} />
          <InfoRow label="Asal Surat" value={surat.asal_surat} />
          <InfoRow label="Media Terima" value={surat.media_terima} />
          <InfoRow label="Jenis Surat" value={surat.jenis_surat} />
          <InfoRow label="Sifat Surat" value={surat.sifat_surat} />
          <InfoRow
            label="Ditujukan Kepada"
            value={surat.ditujukan_kepada || "-"}
          />
          <InfoRow label="Kode Arsip" value={surat.arsip_code || "-"} />
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Perihal</p>
          <p className="font-medium text-gray-800">{surat.perihal}</p>
        </div>
        {surat.isi_ringkas && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Isi Ringkas</p>
            <p className="text-gray-700 text-sm">{surat.isi_ringkas}</p>
          </div>
        )}
        {surat.file_surat && (
          <div className="mt-3">
            <a
              href={`/${surat.file_surat}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              📎 Lihat File Surat
            </a>
          </div>
        )}
      </div>

      {/* Disposisi List */}
      {disposisiList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="font-bold text-gray-700 mb-3">Daftar Disposisi</h2>
          <div className="space-y-3">
            {disposisiList.map((d) => (
              <div
                key={d.id}
                className="border border-gray-100 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">
                    {d.kepada_unit || `User #${d.kepada_user_id}`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      d.status === "selesai"
                        ? "bg-green-100 text-green-600"
                        : d.status === "proses"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <p className="text-gray-600">{d.instruksi}</p>
                {d.batas_waktu && (
                  <p className="text-xs text-gray-400 mt-1">
                    Batas: {d.batas_waktu}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {surat.status === "masuk" && (
          <button
            onClick={handleKonfirmasi}
            disabled={konfirmLoading}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {konfirmLoading
              ? "Memproses..."
              : "✅ Konfirmasi & Teruskan ke Pimpinan"}
          </button>
        )}
        {surat.status === "disposisi" && (
          <button
            onClick={() => navigate(`/surat/masuk/${id}/disposisi`)}
            className="flex-1 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
          >
            📨 Buat Disposisi
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
