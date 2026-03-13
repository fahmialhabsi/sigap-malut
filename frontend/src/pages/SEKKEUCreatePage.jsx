import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const SEK_KEU_LAYANAN_MAP = {
  "RKA/DPA": "LY016",
  Belanja: "LY017",
  Pencairan: "LY018",
  SPJ: "LY019",
  Laporan: "LY020",
  Revisi: "LY021",
  Monitoring: "LY022",
};

const SEK_KEU_JENIS_MAP = Object.fromEntries(
  Object.entries(SEK_KEU_LAYANAN_MAP).map(([jenis, layananId]) => [
    layananId,
    jenis,
  ]),
);

function parseIntegerField(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? value : parsed;
}

function parseDecimalField(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
}

function parseJsonField(value) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default function SEKKEUCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_kerja: "Sekretariat",
    kode_unit: "00",
    layanan_id: "LY016",
    tahun_anggaran: new Date().getFullYear(),
    jenis_layanan_keuangan: "RKA/DPA",
    nomor_dpa: "",
    kode_rekening: "",
    nama_rekening: "",
    pagu_anggaran: "",
    realisasi: "",
    sisa_anggaran: "",
    persentase_realisasi: "",
    jenis_belanja: "",
    uraian_belanja: "",
    keperluan: "",
    penerima_uang: "",
    tanggal_pencairan: "",
    jumlah_pencairan: "",
    nomor_spj: "",
    tanggal_spj: "",
    status_spj: "",
    jenis_revisi: "",
    alasan_revisi: "",
    file_dpa: "",
    file_spj: "",
    file_bukti: "",
    file_laporan: "",
    penanggung_jawab: "Bendahara",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "pending",
    keterangan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "jenis_layanan_keuangan") {
        next.layanan_id =
          SEK_KEU_LAYANAN_MAP[value] || prev.layanan_id || "LY016";

        const isNomorDpa = ["RKA/DPA", "Revisi", "Monitoring"].includes(value);
        const isBelanjaCluster = ["Belanja", "Pencairan", "SPJ"].includes(
          value,
        );
        const isBelanjaOrPencairan = ["Belanja", "Pencairan"].includes(value);
        const isPencairan = value === "Pencairan";
        const isSpj = value === "SPJ";
        const isRevisi = value === "Revisi";
        const isLaporan = value === "Laporan";

        if (!isNomorDpa) {
          next.nomor_dpa = "";
          next.file_dpa = "";
        }

        if (!isBelanjaCluster) {
          next.jenis_belanja = "";
          next.uraian_belanja = "";
        }

        if (!isBelanjaOrPencairan) {
          next.keperluan = "";
        }

        if (!isPencairan) {
          next.penerima_uang = "";
          next.tanggal_pencairan = "";
          next.jumlah_pencairan = "";
        }

        if (!isSpj) {
          next.nomor_spj = "";
          next.tanggal_spj = "";
          next.status_spj = "";
          next.file_spj = "";
        }

        if (!isRevisi) {
          next.jenis_revisi = "";
          next.alasan_revisi = "";
        }

        if (!(isSpj || isPencairan)) {
          next.file_bukti = "";
        }

        if (!isLaporan) {
          next.file_laporan = "";
        }
      }

      if (name === "layanan_id") {
        next.jenis_layanan_keuangan =
          SEK_KEU_JENIS_MAP[value] || prev.jenis_layanan_keuangan || "RKA/DPA";
      }

      if (name === "pagu_anggaran" || name === "realisasi") {
        const pagu = Number.parseFloat(
          name === "pagu_anggaran" ? value : next.pagu_anggaran,
        );
        const realisasi = Number.parseFloat(
          name === "realisasi" ? value : next.realisasi,
        );

        if (!Number.isNaN(pagu) && !Number.isNaN(realisasi)) {
          const sisa = pagu - realisasi;
          next.sisa_anggaran = Number.isFinite(sisa) ? sisa.toFixed(2) : "";

          if (pagu > 0) {
            const persentase = (realisasi / pagu) * 100;
            next.persentase_realisasi = Number.isFinite(persentase)
              ? persentase.toFixed(2)
              : "";
          } else {
            next.persentase_realisasi = "";
          }
        } else {
          next.sisa_anggaran = "";
          next.persentase_realisasi = "";
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        alert("❌ Session expired. Silakan login ulang.");
        navigate("/login");
        return;
      }

      const layananAktif = formData.jenis_layanan_keuangan;
      const isNomorDpa = ["RKA/DPA", "Revisi", "Monitoring"].includes(
        layananAktif,
      );
      const isBelanjaCluster = ["Belanja", "Pencairan", "SPJ"].includes(
        layananAktif,
      );
      const isBelanjaOrPencairan = ["Belanja", "Pencairan"].includes(
        layananAktif,
      );
      const isPencairan = layananAktif === "Pencairan";
      const isSpj = layananAktif === "SPJ";
      const isRevisi = layananAktif === "Revisi";
      const isLaporan = layananAktif === "Laporan";

      const payload = {
        unit_kerja: formData.unit_kerja,
        kode_unit: formData.kode_unit,
        layanan_id:
          SEK_KEU_LAYANAN_MAP[formData.jenis_layanan_keuangan] ||
          formData.layanan_id ||
          "LY016",
        jenis_layanan_keuangan: formData.jenis_layanan_keuangan,
        tahun_anggaran: parseIntegerField(formData.tahun_anggaran),
        nomor_dpa: isNomorDpa ? formData.nomor_dpa || null : null,
        file_dpa: isNomorDpa ? formData.file_dpa || null : null,
        kode_rekening: formData.kode_rekening || null,
        nama_rekening: formData.nama_rekening || null,
        pagu_anggaran: parseDecimalField(formData.pagu_anggaran),
        realisasi: parseDecimalField(formData.realisasi),
        sisa_anggaran: parseDecimalField(formData.sisa_anggaran),
        persentase_realisasi: parseDecimalField(formData.persentase_realisasi),
        jenis_belanja: isBelanjaCluster ? formData.jenis_belanja || null : null,
        uraian_belanja: isBelanjaCluster
          ? formData.uraian_belanja || null
          : null,
        keperluan: isBelanjaOrPencairan ? formData.keperluan || null : null,
        penerima_uang: isPencairan ? formData.penerima_uang || null : null,
        tanggal_pencairan: isPencairan
          ? formData.tanggal_pencairan || null
          : null,
        jumlah_pencairan: isPencairan
          ? parseDecimalField(formData.jumlah_pencairan)
          : null,
        nomor_spj: isSpj ? formData.nomor_spj || null : null,
        tanggal_spj: isSpj ? formData.tanggal_spj || null : null,
        status_spj: isSpj ? formData.status_spj || null : null,
        jenis_revisi: isRevisi ? formData.jenis_revisi || null : null,
        alasan_revisi: isRevisi ? formData.alasan_revisi || null : null,
        file_spj: isSpj ? formData.file_spj || null : null,
        file_bukti:
          isSpj || isPencairan ? parseJsonField(formData.file_bukti) : null,
        file_laporan: isLaporan ? formData.file_laporan || null : null,
        penanggung_jawab: formData.penanggung_jawab,
        pelaksana: formData.pelaksana || user.nama_lengkap || "Staff Keuangan",
        is_sensitive: formData.is_sensitive,
        status: formData.status,
        keterangan: formData.keterangan || null,
        created_by: user.id,
      };

      await api.post("/sek-keu", payload);

      alert("✅ Data keuangan berhasil dibuat!");
      navigate("/module/sek-keu");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const layananAktif = formData.jenis_layanan_keuangan;
  const showNomorDpa = ["RKA/DPA", "Revisi", "Monitoring"].includes(
    layananAktif,
  );
  const showBelanjaCluster = ["Belanja", "Pencairan", "SPJ"].includes(
    layananAktif,
  );
  const showBelanjaOrPencairan = ["Belanja", "Pencairan"].includes(
    layananAktif,
  );
  const showPencairan = layananAktif === "Pencairan";
  const showSpj = layananAktif === "SPJ";
  const showRevisi = layananAktif === "Revisi";
  const showLaporan = layananAktif === "Laporan";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Input Keuangan & Anggaran
        </h2>
        <p className="text-sm text-gray-500">Sekretariat</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Kerja <span className="text-red-500">*</span>
            </label>
            <select
              name="unit_kerja"
              value={formData.unit_kerja}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Sekretariat">
                Sekretariat
              </option>
              <option style={{ color: "#111827" }} value="UPTD">
                UPTD
              </option>
              <option style={{ color: "#111827" }} value="Bidang Ketersediaan">
                Bidang Ketersediaan
              </option>
              <option style={{ color: "#111827" }} value="Bidang Distribusi">
                Bidang Distribusi
              </option>
              <option style={{ color: "#111827" }} value="Bidang Konsumsi">
                Bidang Konsumsi
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="kode_unit"
              value={formData.kode_unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="layanan_id"
              value={formData.layanan_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="LY016">
                Penyusunan RKA & DPA
              </option>
              <option style={{ color: "#111827" }} value="LY017">
                Administrasi Belanja
              </option>
              <option style={{ color: "#111827" }} value="LY018">
                Pencairan Anggaran
              </option>
              <option style={{ color: "#111827" }} value="LY019">
                SPJ & Pertanggungjawaban
              </option>
              <option style={{ color: "#111827" }} value="LY020">
                Laporan Keuangan
              </option>
              <option style={{ color: "#111827" }} value="LY021">
                Revisi Anggaran
              </option>
              <option style={{ color: "#111827" }} value="LY022">
                Monitoring Realisasi
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Anggaran <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="tahun_anggaran"
              value={formData.tahun_anggaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_keuangan"
              value={formData.jenis_layanan_keuangan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="RKA/DPA">
                RKA/DPA
              </option>
              <option style={{ color: "#111827" }} value="Belanja">
                Belanja
              </option>
              <option style={{ color: "#111827" }} value="Pencairan">
                Pencairan
              </option>
              <option style={{ color: "#111827" }} value="SPJ">
                SPJ
              </option>
              <option style={{ color: "#111827" }} value="Laporan">
                Laporan
              </option>
              <option style={{ color: "#111827" }} value="Revisi">
                Revisi
              </option>
              <option style={{ color: "#111827" }} value="Monitoring">
                Monitoring
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="pending">
                Pending
              </option>
              <option style={{ color: "#111827" }} value="proses">
                Proses
              </option>
              <option style={{ color: "#111827" }} value="diverifikasi">
                Diverifikasi
              </option>
              <option style={{ color: "#111827" }} value="disetujui">
                Disetujui
              </option>
              <option style={{ color: "#111827" }} value="ditolak">
                Ditolak
              </option>
              <option style={{ color: "#111827" }} value="selesai">
                Selesai
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensitivitas Data <span className="text-red-500">*</span>
            </label>
            <select
              name="is_sensitive"
              value={formData.is_sensitive}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: "#111827", backgroundColor: "#ffffff" }}
              required
            >
              <option style={{ color: "#111827" }} value="Biasa">
                Biasa
              </option>
              <option style={{ color: "#111827" }} value="Sensitif">
                Sensitif
              </option>
            </select>
          </div>

          {showNomorDpa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor DPA
              </label>
              <input
                type="text"
                name="nomor_dpa"
                value={formData.nomor_dpa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showNomorDpa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File DPA
              </label>
              <input
                type="text"
                name="file_dpa"
                value={formData.file_dpa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                placeholder="/uploads/dpa.pdf"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Rekening
            </label>
            <input
              type="text"
              name="kode_rekening"
              value={formData.kode_rekening}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Rekening
            </label>
            <input
              type="text"
              name="nama_rekening"
              value={formData.nama_rekening}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pagu Anggaran
            </label>
            <input
              type="number"
              name="pagu_anggaran"
              value={formData.pagu_anggaran}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Realisasi
            </label>
            <input
              type="number"
              name="realisasi"
              value={formData.realisasi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sisa Anggaran
            </label>
            <input
              type="number"
              name="sisa_anggaran"
              value={formData.sisa_anggaran}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Persentase Realisasi (%)
            </label>
            <input
              type="number"
              name="persentase_realisasi"
              value={formData.persentase_realisasi}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          {showBelanjaCluster && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Belanja
              </label>
              <select
                name="jenis_belanja"
                value={formData.jenis_belanja}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              >
                <option style={{ color: "#111827" }} value="">
                  Pilih Jenis Belanja
                </option>
                <option style={{ color: "#111827" }} value="Belanja Pegawai">
                  Belanja Pegawai
                </option>
                <option style={{ color: "#111827" }} value="Belanja Barang">
                  Belanja Barang
                </option>
                <option style={{ color: "#111827" }} value="Belanja Modal">
                  Belanja Modal
                </option>
              </select>
            </div>
          )}

          {showPencairan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penerima Uang
              </label>
              <input
                type="text"
                name="penerima_uang"
                value={formData.penerima_uang}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showPencairan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Pencairan
              </label>
              <input
                type="date"
                name="tanggal_pencairan"
                value={formData.tanggal_pencairan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showPencairan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Pencairan
              </label>
              <input
                type="number"
                name="jumlah_pencairan"
                value={formData.jumlah_pencairan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showSpj && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor SPJ
              </label>
              <input
                type="text"
                name="nomor_spj"
                value={formData.nomor_spj}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showSpj && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal SPJ
              </label>
              <input
                type="date"
                name="tanggal_spj"
                value={formData.tanggal_spj}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showSpj && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status SPJ
              </label>
              <select
                name="status_spj"
                value={formData.status_spj}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              >
                <option style={{ color: "#111827" }} value="">
                  Pilih Status SPJ
                </option>
                <option style={{ color: "#111827" }} value="Belum SPJ">
                  Belum SPJ
                </option>
                <option style={{ color: "#111827" }} value="SPJ Lengkap">
                  SPJ Lengkap
                </option>
                <option style={{ color: "#111827" }} value="SPJ Kurang">
                  SPJ Kurang
                </option>
                <option style={{ color: "#111827" }} value="Diverifikasi">
                  Diverifikasi
                </option>
                <option style={{ color: "#111827" }} value="Ditolak">
                  Ditolak
                </option>
              </select>
            </div>
          )}

          {showSpj && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File SPJ
              </label>
              <input
                type="text"
                name="file_spj"
                value={formData.file_spj}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                placeholder="/uploads/spj.pdf"
              />
            </div>
          )}

          {showRevisi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Revisi
              </label>
              <select
                name="jenis_revisi"
                value={formData.jenis_revisi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                style={{ color: "#111827", backgroundColor: "#ffffff" }}
              >
                <option style={{ color: "#111827" }} value="">
                  Pilih Jenis Revisi
                </option>
                <option style={{ color: "#111827" }} value="Revisi Anggaran">
                  Revisi Anggaran
                </option>
                <option style={{ color: "#111827" }} value="Pergeseran">
                  Pergeseran
                </option>
                <option style={{ color: "#111827" }} value="Tambahan">
                  Tambahan
                </option>
              </select>
            </div>
          )}

          {showBelanjaCluster && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uraian Belanja
              </label>
              <textarea
                name="uraian_belanja"
                value={formData.uraian_belanja}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showBelanjaOrPencairan && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keperluan
              </label>
              <textarea
                name="keperluan"
                value={formData.keperluan}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {showRevisi && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Revisi
              </label>
              <textarea
                name="alasan_revisi"
                value={formData.alasan_revisi}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              />
            </div>
          )}

          {(showSpj || showPencairan) && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Bukti (JSON Array)
              </label>
              <textarea
                name="file_bukti"
                value={formData.file_bukti}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                placeholder='["/uploads/bukti-1.pdf", "/uploads/bukti-2.jpg"]'
              />
            </div>
          )}

          {showLaporan && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Laporan
              </label>
              <input
                type="text"
                name="file_laporan"
                value={formData.file_laporan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
                placeholder="/uploads/laporan-keuangan.pdf"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="penanggung_jawab"
              value={formData.penanggung_jawab}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pelaksana
            </label>
            <input
              type="text"
              name="pelaksana"
              value={formData.pelaksana}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/module/sek-keu")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
