import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SEKKEPCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [asnList, setAsnList] = useState([]);

  const [formData, setFormData] = useState({
    layanan_id: "LY008",
    asn_id: "",
    nip: "",
    nama_asn: "",
    jenis_layanan_kepegawaian: "Data Induk",
    // Kenaikan pangkat fields
    pangkat_lama: "",
    pangkat_baru: "",
    golongan_lama: "",
    golongan_baru: "",
    tmt_kenaikan: "",
    // Mutasi fields
    jabatan_lama: "",
    jabatan_baru: "",
    // Gaji/Tunjangan fields
    gaji_pokok: "",
    total_tunjangan: "",
    // Cuti fields
    jenis_cuti: "",
    tanggal_mulai_cuti: "",
    tanggal_selesai_cuti: "",
    lama_cuti: "",
    // Penilaian Kinerja fields
    nilai_skp: "",
    predikat_kinerja: "",
    // Disiplin fields
    jenis_sanksi: "",
    uraian_sanksi: "",
    // Pensiun fields
    tanggal_pensiun: "",
    jenis_pensiun: "",
    // Common fields
    nomor_sk: "",
    tanggal_sk: "",
    file_sk: "",
    penanggung_jawab: "Kasubbag Kepegawaian",
    pelaksana: "",
    is_sensitive: "Sensitif",
    status: "pending",
    keterangan: "",
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Fetch ASN list from backend or hardcode for demo
      setAsnList([
        { id: 1, nip: "197501011999031001", nama: "Drs. Budi Santoso, MM" },
        { id: 2, nip: "197605152002012001", nama: "Siti Nurhaliza, S.Pd" },
        { id: 3, nip: "197803202003021001", nama: "Ahmad Wijaya, S.H" },
        { id: 4, nip: "197905252004031001", nama: "Dewi Lestari, S.E" },
        { id: 5, nip: "198001152005021001", nama: "Hendra Kusuma, S.Kom" },
      ]);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const handleChangeASN = (e) => {
    const asnId = e.target.value;
    const asn = asnList.find((a) => a.id === parseInt(asnId));

    setFormData({
      ...formData,
      asn_id: asnId,
      nip: asn?.nip || "",
      nama_asn: asn?.nama || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-calculate lama_cuti if dates are provided
    if (name === "tanggal_mulai_cuti" || name === "tanggal_selesai_cuti") {
      const mulai = new Date(
        name === "tanggal_mulai_cuti" ? value : formData.tanggal_mulai_cuti,
      );
      const selesai = new Date(
        name === "tanggal_selesai_cuti" ? value : formData.tanggal_selesai_cuti,
      );

      if (mulai && selesai) {
        const lama = Math.ceil((selesai - mulai) / (1000 * 60 * 60 * 24)) + 1;
        setFormData((prev) => ({ ...prev, lama_cuti: lama }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.asn_id || !formData.nip || !formData.nama_asn) {
        alert("❌ ASN, NIP, dan Nama ASN wajib diisi!");
        setLoading(false);
        return;
      }

      if (!formData.jenis_layanan_kepegawaian) {
        alert("❌ Jenis Layanan wajib dipilih!");
        setLoading(false);
        return;
      }

      // Validate conditional fields
      if (
        formData.jenis_layanan_kepegawaian === "Kenaikan Pangkat" &&
        (!formData.pangkat_baru || !formData.golongan_baru)
      ) {
        alert(
          "❌ Untuk Kenaikan Pangkat, Pangkat Baru dan Golongan Baru wajib diisi!",
        );
        setLoading(false);
        return;
      }

      if (
        formData.jenis_layanan_kepegawaian === "Mutasi" &&
        (!formData.jabatan_baru || !formData.tmt_kenaikan)
      ) {
        alert("❌ Untuk Mutasi, Jabatan Baru dan TMT wajib diisi!");
        setLoading(false);
        return;
      }

      if (
        formData.jenis_layanan_kepegawaian === "Cuti" &&
        (!formData.jenis_cuti || !formData.tanggal_mulai_cuti)
      ) {
        alert("❌ Untuk Cuti, Jenis Cuti dan Tanggal Mulai wajib diisi!");
        setLoading(false);
        return;
      }

      if (
        formData.jenis_layanan_kepegawaian === "Penilaian Kinerja" &&
        (!formData.nilai_skp || !formData.predikat_kinerja)
      ) {
        alert(
          "❌ Untuk Penilaian Kinerja, Nilai SKP dan Predikat wajib diisi!",
        );
        setLoading(false);
        return;
      }

      // Prepare payload (remove empty fields)
      const payload = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== "" && value !== null && value !== undefined) {
          payload[key] = value;
        }
      });

      // Submit
      const response = await api.post("/sek-kep", payload);

      if (response.data.success) {
        alert(
          `✅ Data kepegawaian berhasil dibuat!\n\nID: ${response.data.data.id}`,
        );
        navigate("/module/sek-kep");
      } else {
        alert("❌ Error: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || err.message;
      alert("❌ Error:\n\n" + errMsg);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Conditional rendering of fields based on jenis_layanan_kepegawaian
  const renderConditionalFields = () => {
    const type = formData.jenis_layanan_kepegawaian;

    return (
      <>
        {/* Kenaikan Pangkat Fields */}
        {type === "Kenaikan Pangkat" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pangkat Lama
              </label>
              <input
                type="text"
                name="pangkat_lama"
                value={formData.pangkat_lama}
                onChange={handleChange}
                placeholder="Contoh: Penata Tingkat II"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pangkat Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pangkat_baru"
                value={formData.pangkat_baru}
                onChange={handleChange}
                placeholder="Contoh: Penata"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Golongan Lama
              </label>
              <input
                type="text"
                name="golongan_lama"
                value={formData.golongan_lama}
                onChange={handleChange}
                placeholder="Contoh: III/d"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Golongan Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="golongan_baru"
                value={formData.golongan_baru}
                onChange={handleChange}
                placeholder="Contoh: III/c"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TMT Kenaikan
              </label>
              <input
                type="date"
                name="tmt_kenaikan"
                value={formData.tmt_kenaikan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Mutasi Fields */}
        {type === "Mutasi" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jabatan Lama
              </label>
              <input
                type="text"
                name="jabatan_lama"
                value={formData.jabatan_lama}
                onChange={handleChange}
                placeholder="Contoh: Kepala Bidang Ketersediaan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jabatan Baru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jabatan_baru"
                value={formData.jabatan_baru}
                onChange={handleChange}
                placeholder="Contoh: Kepala Bidang Distribusi"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TMT Mutasi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tmt_kenaikan"
                value={formData.tmt_kenaikan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Gaji & Tunjangan Fields */}
        {type === "Gaji Tunjangan" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gaji Pokok (Rp)
              </label>
              <input
                type="number"
                name="gaji_pokok"
                value={formData.gaji_pokok}
                onChange={handleChange}
                placeholder="Contoh: 3500000"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Tunjangan (Rp)
              </label>
              <input
                type="number"
                name="total_tunjangan"
                value={formData.total_tunjangan}
                onChange={handleChange}
                placeholder="Contoh: 1500000"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Cuti Fields */}
        {type === "Cuti" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Cuti <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_cuti"
                value={formData.jenis_cuti}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih --</option>
                <option value="Tahunan">Tahunan</option>
                <option value="Sakit">Sakit</option>
                <option value="Besar">Besar</option>
                <option value="Melahirkan">Melahirkan</option>
                <option value="Alasan Penting">Alasan Penting</option>
                <option value="Luar Tanggungan Negara">
                  Luar Tanggungan Negara
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai Cuti <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai_cuti"
                value={formData.tanggal_mulai_cuti}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai Cuti
              </label>
              <input
                type="date"
                name="tanggal_selesai_cuti"
                value={formData.tanggal_selesai_cuti}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lama Cuti (Hari) - Auto
              </label>
              <input
                type="number"
                name="lama_cuti"
                value={formData.lama_cuti}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </>
        )}

        {/* Penilaian Kinerja Fields */}
        {type === "Penilaian Kinerja" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai SKP <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="nilai_skp"
                value={formData.nilai_skp}
                onChange={handleChange}
                placeholder="Contoh: 78.50"
                step="0.01"
                min="0"
                max="100"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Predikat Kinerja <span className="text-red-500">*</span>
              </label>
              <select
                name="predikat_kinerja"
                value={formData.predikat_kinerja}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih --</option>
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang">Kurang</option>
                <option value="Buruk">Buruk</option>
              </select>
            </div>
          </>
        )}

        {/* Disiplin Fields */}
        {type === "Disiplin" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Sanksi
              </label>
              <select
                name="jenis_sanksi"
                value={formData.jenis_sanksi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih --</option>
                <option value="Ringan">Ringan</option>
                <option value="Sedang">Sedang</option>
                <option value="Berat">Berat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uraian Sanksi
              </label>
              <textarea
                name="uraian_sanksi"
                value={formData.uraian_sanksi}
                onChange={handleChange}
                rows={3}
                placeholder="Deskripsi pelanggaran dan sanksi yang diberikan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Pensiun Fields */}
        {type === "Pensiun" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Pensiun
              </label>
              <input
                type="date"
                name="tanggal_pensiun"
                value={formData.tanggal_pensiun}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pensiun
              </label>
              <select
                name="jenis_pensiun"
                value={formData.jenis_pensiun}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih --</option>
                <option value="BUP (Batas Usia Pensiun)">
                  BUP (Batas Usia Pensiun)
                </option>
                <option value="Atas Permintaan Sendiri">
                  Atas Permintaan Sendiri
                </option>
                <option value="Alasan Lain">Alasan Lain</option>
              </select>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Tambah Data Kepegawaian
        </h2>
        <p className="text-sm text-gray-500">
          SEK-KEP - Modul Kepegawaian / ASN Data Management
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Section 1: ASN Data */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Data ASN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih ASN <span className="text-red-500">*</span>
              </label>
              <select
                name="asn_id"
                value={formData.asn_id}
                onChange={handleChangeASN}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih ASN --</option>
                {asnList.map((asn) => (
                  <option key={asn.id} value={asn.id}>
                    {asn.nip} - {asn.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama ASN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_asn"
                value={formData.nama_asn}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jenis Layanan */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📌 Jenis Layanan Kepegawaian
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Jenis Layanan <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_layanan_kepegawaian"
              value={formData.jenis_layanan_kepegawaian}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Data Induk">Data Induk</option>
              <option value="Kenaikan Pangkat">Kenaikan Pangkat</option>
              <option value="Mutasi">Mutasi</option>
              <option value="Gaji Tunjangan">Gaji & Tunjangan</option>
              <option value="Cuti">Cuti</option>
              <option value="Penilaian Kinerja">Penilaian Kinerja</option>
              <option value="Disiplin">Disiplin</option>
              <option value="Pensiun">Pensiun</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Pilihan ini menentukan field tambahan yang ditampilkan
            </p>
          </div>
        </div>

        {/* Section 3: Conditional Fields */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📝 Data Spesifik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderConditionalFields()}
          </div>
        </div>

        {/* Section 4: Dokumen & SK */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📄 Dokumen Pendukung
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor SK
              </label>
              <input
                type="text"
                name="nomor_sk"
                value={formData.nomor_sk}
                onChange={handleChange}
                placeholder="Contoh: 001/SK/Disp.Pangan/II/2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal SK
              </label>
              <input
                type="date"
                name="tanggal_sk"
                value={formData.tanggal_sk}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File SK (upload später via edit)
              </label>
              <p className="text-xs text-gray-500">
                File upload akan ditambahkan di halaman edit setelah data dibuat
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: PIC & Status */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Penanggung Jawab & Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penanggung Jawab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="penanggung_jawab"
                value={formData.penanggung_jawab}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pelaksana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pelaksana"
                value={formData.pelaksana}
                onChange={handleChange}
                placeholder="Nama yang melaksanakan"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">🔴 Pending</option>
                <option value="proses">🟡 Proses</option>
                <option value="disetujui">🟢 Disetujui</option>
                <option value="ditolak">❌ Ditolak</option>
                <option value="selesai">✅ Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Sensitivitas <span className="text-red-500">*</span>
              </label>
              <select
                name="is_sensitive"
                value={formData.is_sensitive}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Biasa">Biasa</option>
                <option value="Sensitif">Sensitif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 6: Keterangan */}
        <div className="border-b pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan / Catatan
          </label>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows={4}
            placeholder="Catatan tambahan atau keterangan lainnya"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate("/module/sek-kep")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "💾 Simpan Data Kepegawaian"}
          </button>
        </div>
      </form>
    </div>
  );
}
