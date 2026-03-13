import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const BKT_FSL_LAYANAN_MAP = {
  "Intervensi Produksi": "LY066",
  "Intervensi Distribusi": "LY066",
  "Intervensi Konsumsi": "LY066",
  "Bantuan Pangan": "LY066",
  Lainnya: "LY066",
};

const BKT_BMB_LAYANAN_MAP = {
  Bimtek: "LY067",
  Pemetaan: "LY068",
  Supervisi: "LY069",
  Pendampingan: "LY070",
  Konsultasi: "LY071",
};

const BKT_KBJ_LAYANAN_MAP = {
  "Analisis Ketersediaan": "LY052",
  Rekomendasi: "LY053",
  "Penetapan Komoditas Strategis": "LY054",
  "Pedoman Teknis": "LY055",
  "Sinkronisasi Pusat-Daerah": "LY056",
};

const BKT_PGD_LAYANAN_MAP = {
  "Pemantauan Produksi": "LY057",
  "Pemantauan Pasokan": "LY058",
  "Neraca Pangan": "LY059",
  "Early Warning": "LY060",
  "Sistem Informasi": "LY061",
};

const BKT_KRW_LAYANAN_MAP = {
  Identifikasi: "LY062",
  "Peta Kerawanan": "LY063",
  "Rencana Aksi": "LY064",
  "Koordinasi Lintas Sektor": "LY065",
};

const BKT_MEV_LAYANAN_MAP = {
  "Monev Pelaporan": "LY072",
  "Monev Penanganan Kerawanan": "LY073",
  "Laporan Kinerja": "LY074",
  "Laporan Teknis": "LY075",
  "Data SAKIP": "LY076",
};

const BDS_KBJ_LAYANAN_MAP = {
  "Kebijakan Distribusi": "LY077",
  "Peta Distribusi": "LY078",
  "Penetapan Jalur": "LY079",
  Sinkronisasi: "LY080",
  "Pedoman Teknis": "LY081",
};

const BDS_MON_LAYANAN_MAP = {
  "Arus Distribusi": "LY082",
  "Stok Pasar": "LY083",
  "Hambatan Distribusi": "LY084",
  "Fasilitasi Kelancaran": "LY085",
  "Koordinasi Wilayah": "LY086",
};

const BDS_HRG_LAYANAN_MAP = {
  "Pemantauan Harga": "LY087",
  "Analisis Fluktuasi": "LY088",
  "Rekomendasi Stabilisasi": "LY089",
  "Operasi Pasar": "LY090",
  "Koordinasi TPID": "LY091",
};

const BDS_CPD_LAYANAN_MAP = {
  Perencanaan: "LY092",
  Pengadaan: "LY093",
  "Pengelolaan Stok": "LY094",
  "Penyaluran Darurat": "LY095",
  Evaluasi: "LY096",
};

const BDS_BMB_LAYANAN_MAP = {
  "Bimtek Distribusi": "LY097",
  "Bimtek CPPD": "LY098",
  "Supervisi Lapangan": "LY099",
  "Konsultasi Teknis": "LY100",
  "Fasilitasi Stakeholder": "LY101",
};

const BDS_EVL_LAYANAN_MAP = {
  "Evaluasi Distribusi": "LY102",
  "Evaluasi Stabilisasi Harga": "LY103",
  "Evaluasi CPPD": "LY104",
  "Data SAKIP": "LY105",
};

const BKS_KBJ_LAYANAN_MAP = {
  "Kebijakan Konsumsi": "LY107",
  "Pedoman B2SA": "LY108",
  "Penganekaragaman Pangan": "LY109",
  Sinkronisasi: "LY110",
  "Rekomendasi Intervensi": "LY111",
};

const BKS_DVR_LAYANAN_MAP = {
  "Pengembangan Pangan Lokal": "LY112",
  "Pemanfaatan Pekarangan": "LY113",
  Kampanye: "LY114",
  "Edukasi B2SA": "LY115",
  "Pendampingan Kelompok": "LY116",
};

const BKS_KMN_LAYANAN_MAP = {
  "Pembinaan Pangan Segar": "LY117",
  "Sosialisasi Pangan Aman": "LY118",
  "Fasilitasi PSAT": "LY119",
  "Koordinasi Pengawasan": "LY120",
  "Rekomendasi Teknis": "LY121",
};

const BKS_BMB_LAYANAN_MAP = {
  "Bimtek Konsumsi": "LY122",
  "Bimtek Keamanan Pangan": "LY123",
  "Pelatihan Pengolahan": "LY124",
  Penyuluhan: "LY125",
  "Konsultasi Teknis": "LY126",
};

const BKS_EVL_LAYANAN_MAP = {
  "Evaluasi Program Konsumsi": "LY127",
  "Evaluasi Penganekaragaman": "LY128",
  "Evaluasi Keamanan Pangan": "LY129",
};

const BKS_LAP_LAYANAN_MAP = {
  "Laporan Kinerja": "LY130",
  "Data SAKIP": "LY131",
};

const SEK_KEP_LAYANAN_MAP = {
  "Data Induk": "LY008",
  "Kenaikan Pangkat": "LY009",
  Mutasi: "LY010",
  "Gaji Tunjangan": "LY011",
  Cuti: "LY012",
  "Penilaian Kinerja": "LY013",
  Disiplin: "LY014",
  Pensiun: "LY015",
};

const SEK_KEU_LAYANAN_MAP = {
  "RKA/DPA": "LY016",
  Belanja: "LY017",
  Pencairan: "LY018",
  SPJ: "LY019",
  Laporan: "LY020",
  Revisi: "LY021",
  Monitoring: "LY022",
};

const SEK_RMH_LAYANAN_MAP = {
  "Perjalanan Dinas": "LY007",
  Kebersihan: "LY030",
  Keamanan: "LY031",
  Fasilitas: "LY032",
  "Ruang Rapat": "LY033",
  Kendaraan: "LY034",
};

const SEK_HUM_LAYANAN_MAP = {
  Protokol: "LY035",
  "Acara Resmi": "LY036",
  "Penerimaan Tamu": "LY037",
  Publikasi: "LY038",
  Dokumentasi: "LY039",
};

const SEK_KBJ_LAYANAN_MAP = {
  "Bahan Kebijakan Teknis": "LY046",
  "Rekapitulasi Laporan": "LY047",
};

export default function EditPage() {
  const { moduleId, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/${moduleId}/${id}`);
      const data = response.data.data;
      setFormData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [moduleId, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (moduleId === "sek-kep") {
        if (name === "jenis_layanan_kepegawaian") {
          next.layanan_id =
            SEK_KEP_LAYANAN_MAP[value] || prev.layanan_id || "LY008";
        }

        if (name === "tanggal_mulai_cuti" || name === "tanggal_selesai_cuti") {
          const mulai =
            name === "tanggal_mulai_cuti" ? value : next.tanggal_mulai_cuti;
          const selesai =
            name === "tanggal_selesai_cuti" ? value : next.tanggal_selesai_cuti;

          if (mulai && selesai) {
            const mulaiDate = new Date(mulai);
            const selesaiDate = new Date(selesai);
            if (
              !Number.isNaN(mulaiDate.getTime()) &&
              !Number.isNaN(selesaiDate.getTime()) &&
              selesaiDate >= mulaiDate
            ) {
              const lamaCuti =
                Math.ceil((selesaiDate - mulaiDate) / (1000 * 60 * 60 * 24)) +
                1;
              next.lama_cuti = lamaCuti;
            }
          } else {
            next.lama_cuti = "";
          }
        }
      }

      if (moduleId === "sek-keu") {
        if (name === "jenis_layanan_keuangan") {
          next.layanan_id =
            SEK_KEU_LAYANAN_MAP[value] || prev.layanan_id || "LY016";
        }

        if (
          name === "pagu_anggaran" ||
          name === "realisasi" ||
          name === "jumlah_pencairan"
        ) {
          const pagu = Number.parseFloat(next.pagu_anggaran);
          const realisasi = Number.parseFloat(next.realisasi);

          if (!Number.isNaN(pagu) && !Number.isNaN(realisasi)) {
            const sisa = pagu - realisasi;
            next.sisa_anggaran = Number.isFinite(sisa) ? sisa.toFixed(2) : "";

            if (pagu > 0) {
              const persen = (realisasi / pagu) * 100;
              next.persentase_realisasi = Number.isFinite(persen)
                ? persen.toFixed(2)
                : "";
            } else {
              next.persentase_realisasi = "";
            }
          }
        }
      }

      if (moduleId === "sek-rmh") {
        if (name === "jenis_layanan_rumah_tangga") {
          next.layanan_id =
            SEK_RMH_LAYANAN_MAP[value] || prev.layanan_id || "LY007";

          const isPerjalanan = value === "Perjalanan Dinas";
          const isKebersihan = value === "Kebersihan";
          const isKeamanan = value === "Keamanan";
          const isFasilitas = value === "Fasilitas";
          const isRuangRapat = value === "Ruang Rapat";
          const isKendaraan = value === "Kendaraan";

          if (!isPerjalanan) {
            next.nomor_sppd = "";
            next.nomor_st = "";
            next.nama_pegawai = "";
            next.nip_pegawai = "";
            next.tujuan = "";
            next.keperluan = "";
            next.tanggal_berangkat = "";
            next.tanggal_kembali = "";
            next.lama_hari = "";
            next.biaya_transport = "";
            next.biaya_penginapan = "";
            next.uang_harian = "";
            next.total_biaya = "";
            next.file_sppd = "";
            next.file_laporan = "";
          }

          if (!isKebersihan) {
            next.area_kebersihan = "";
            next.jadwal_kebersihan = "";
            next.petugas_kebersihan = "";
          }

          if (!isKeamanan) {
            next.pos_keamanan = "";
            next.shift_keamanan = "";
            next.petugas_keamanan = "";
          }

          if (!isFasilitas) {
            next.jenis_fasilitas = "";
            next.kondisi_fasilitas = "";
          }

          if (!isRuangRapat) {
            next.nama_ruang_rapat = "";
            next.kapasitas = "";
            next.tanggal_pemesanan = "";
            next.jam_mulai = "";
            next.jam_selesai = "";
            next.pemesan = "";
          }

          if (!isKendaraan) {
            next.nomor_polisi = "";
            next.jenis_kendaraan = "";
            next.driver = "";
            next.tanggal_pakai = "";
            next.km_awal = "";
            next.km_akhir = "";
            next.bbm_liter = "";
          }
        }

        if (name === "tanggal_berangkat" || name === "tanggal_kembali") {
          const berangkat =
            name === "tanggal_berangkat" ? value : next.tanggal_berangkat;
          const kembali =
            name === "tanggal_kembali" ? value : next.tanggal_kembali;

          if (berangkat && kembali) {
            const berangkatDate = new Date(berangkat);
            const kembaliDate = new Date(kembali);

            if (
              !Number.isNaN(berangkatDate.getTime()) &&
              !Number.isNaN(kembaliDate.getTime()) &&
              kembaliDate >= berangkatDate
            ) {
              next.lama_hari =
                Math.ceil(
                  (kembaliDate - berangkatDate) / (1000 * 60 * 60 * 24),
                ) + 1;
            }
          } else if (next.jenis_layanan_rumah_tangga === "Perjalanan Dinas") {
            next.lama_hari = "";
          }
        }
      }

      if (moduleId === "sek-hum" && name === "jenis_layanan_humas") {
        next.layanan_id =
          SEK_HUM_LAYANAN_MAP[value] || prev.layanan_id || "LY035";
      }

      if (moduleId === "sek-kbj" && name === "jenis_layanan_kebijakan") {
        next.layanan_id =
          SEK_KBJ_LAYANAN_MAP[value] || prev.layanan_id || "LY046";
      }

      if (moduleId === "bks-kbj" && name === "jenis_kebijakan") {
        next.layanan_id =
          BKS_KBJ_LAYANAN_MAP[value] || prev.layanan_id || "LY107";
      }

      if (moduleId === "bks-dvr" && name === "jenis_kegiatan") {
        next.layanan_id =
          BKS_DVR_LAYANAN_MAP[value] || prev.layanan_id || "LY112";
      }

      if (moduleId === "bks-kmn" && name === "jenis_kegiatan_keamanan") {
        next.layanan_id =
          BKS_KMN_LAYANAN_MAP[value] || prev.layanan_id || "LY117";
      }

      if (moduleId === "bks-bmb" && name === "jenis_kegiatan") {
        next.layanan_id =
          BKS_BMB_LAYANAN_MAP[value] || prev.layanan_id || "LY122";
      }

      if (moduleId === "bks-evl" && name === "jenis_evaluasi") {
        next.layanan_id =
          BKS_EVL_LAYANAN_MAP[value] || prev.layanan_id || "LY127";
      }

      if (moduleId === "bks-lap" && name === "jenis_laporan") {
        next.layanan_id =
          BKS_LAP_LAYANAN_MAP[value] || prev.layanan_id || "LY130";
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (moduleId === "sek-kep") {
      const validationError = validateSekKepForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    if (moduleId === "sek-keu") {
      const validationError = validateSekKeuForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    if (moduleId === "sek-ast") {
      const validationError = validateSekAstForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    if (moduleId === "sek-rmh") {
      const validationError = validateSekRmhForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    if (moduleId === "sek-hum") {
      const validationError = validateSekHumForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    if (moduleId === "sek-kbj") {
      const validationError = validateSekKbjForm(formData);
      if (validationError) {
        alert(`❌ ${validationError}`);
        setSaving(false);
        return;
      }
    }

    try {
      await api.put(
        `/${moduleId}/${id}`,
        buildSubmitPayload(moduleId, formData),
      );
      alert("✅ Data berhasil diupdate!");
      navigate(`/module/${moduleId}`);
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
  const fields = getEditableFields(moduleId, formData);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit {moduleName}</h2>
        <p className="text-sm text-gray-500">ID: {id}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>

              {renderField(field, formData[field.name], handleChange)}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/module/${moduleId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper: Render field based on type
function renderField(field, value, onChange) {
  const baseClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white";

  if (field.type === "select") {
    return (
      <select
        name={field.name}
        value={value ?? ""}
        onChange={onChange}
        className={baseClass}
        style={{ color: "#111827", backgroundColor: "#ffffff" }}
        required={field.required}
      >
        {field.options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ color: "#111827" }}
          >
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    const textareaValue =
      value === null || value === undefined
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : value;

    return (
      <textarea
        name={field.name}
        value={textareaValue}
        onChange={onChange}
        rows={3}
        className={baseClass}
        required={field.required}
        readOnly={field.readOnly}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        name={field.name}
        value={value ?? ""}
        onChange={onChange}
        step={field.step || "0.01"}
        className={baseClass}
        required={field.required}
        readOnly={field.readOnly}
      />
    );
  }

  return (
    <input
      type={field.type || "text"}
      name={field.name}
      value={value ?? ""}
      onChange={onChange}
      className={baseClass}
      required={field.required}
      readOnly={field.readOnly}
    />
  );
}

// Helper: Get module name
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "sek-kep": "Kepegawaian",
    "sek-keu": "Keuangan & Anggaran",
    "sek-rmh": "Rumah Tangga & Umum",
    "sek-ast": "Aset & BMD",
    "sek-hum": "Protokol & Kehumasan",
    "sek-kbj": "Kebijakan & Koordinasi",
    "bds-hrg": "Harga Pangan",
    "bds-kbj": "Kebijakan Distribusi",
    "bds-mon": "Monitoring Distribusi",
    "bds-cpd": "Cadangan Pangan Daerah (CPPD)",
    "bds-bmb": "Bimbingan & Pendampingan Distribusi",
    "bds-evl": "Evaluasi Distribusi",
    "bds-lap": "Pelaporan Kinerja Distribusi",
    "bkt-pgd": "Produksi Pangan",
    "bkt-kbj": "Kebijakan & Analisis Ketersediaan",
    "bkt-krw": "Kerawanan Pangan",
    "bkt-mev": "Monitoring Evaluasi & Pelaporan",
    "bkt-fsl": "Fasilitasi & Intervensi",
    "bkt-bmb": "Bimbingan & Pendampingan",
    "bks-kbj": "Kebijakan Konsumsi Pangan",
    "bks-dvr": "Penganekaragaman Pangan",
    "bks-kmn": "Keamanan Pangan",
    "bks-bmb": "Bimbingan & Pelatihan Konsumsi",
    "bks-evl": "Monitoring Evaluasi Konsumsi",
    "bks-lap": "Laporan Kinerja Konsumsi",
  };
  return names[moduleId] || moduleId.toUpperCase();
}

// Helper: Define editable fields per module
function getEditableFields(moduleId, formData = {}) {
  const commonFields = {
    "sek-adm": [
      {
        name: "nomor_surat",
        label: "Nomor Surat",
        type: "text",
        required: true,
      },
      {
        name: "jenis_naskah",
        label: "Jenis Naskah",
        type: "select",
        required: true,
        options: [
          { value: "Surat Masuk", label: "Surat Masuk" },
          { value: "Surat Keluar", label: "Surat Keluar" },
          { value: "SK", label: "SK" },
          { value: "SE", label: "SE" },
          { value: "ST", label: "ST" },
          { value: "SU", label: "SU" },
          { value: "ND", label: "ND" },
          { value: "MEMO", label: "MEMO" },
          { value: "BA", label: "BA" },
          { value: "Nota Dinas", label: "Nota Dinas" },
          { value: "Laporan", label: "Laporan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "tanggal_surat",
        label: "Tanggal Surat",
        type: "date",
        required: true,
      },
      {
        name: "pengirim_penerima",
        label: "Pengirim/Penerima",
        type: "text",
        required: true,
      },
      { name: "perihal", label: "Perihal", type: "text", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "proses", label: "Proses" },
          { value: "selesai", label: "Selesai" },
          { value: "arsip", label: "Arsip" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-kep": [
      {
        name: "asn_id",
        label: "ID ASN",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "nip",
        label: "NIP",
        type: "text",
        required: true,
      },
      {
        name: "nama_asn",
        label: "Nama ASN",
        type: "text",
        required: true,
      },
      {
        name: "jenis_layanan_kepegawaian",
        label: "Jenis Layanan",
        type: "select",
        required: true,
        options: [
          { value: "Data Induk", label: "Data Induk" },
          { value: "Kenaikan Pangkat", label: "Kenaikan Pangkat" },
          { value: "Mutasi", label: "Mutasi" },
          { value: "Gaji Tunjangan", label: "Gaji Tunjangan" },
          { value: "Cuti", label: "Cuti" },
          { value: "Penilaian Kinerja", label: "Penilaian Kinerja" },
          { value: "Disiplin", label: "Disiplin" },
          { value: "Pensiun", label: "Pensiun" },
        ],
      },
      {
        name: "pangkat_lama",
        label: "Pangkat Lama",
        type: "text",
        showFor: ["Kenaikan Pangkat"],
      },
      {
        name: "pangkat_baru",
        label: "Pangkat Baru",
        type: "text",
        required: true,
        showFor: ["Kenaikan Pangkat"],
      },
      {
        name: "golongan_lama",
        label: "Golongan Lama",
        type: "text",
        showFor: ["Kenaikan Pangkat"],
      },
      {
        name: "golongan_baru",
        label: "Golongan Baru",
        type: "text",
        required: true,
        showFor: ["Kenaikan Pangkat"],
      },
      {
        name: "jabatan_lama",
        label: "Jabatan Lama",
        type: "text",
        showFor: ["Mutasi"],
      },
      {
        name: "jabatan_baru",
        label: "Jabatan Baru",
        type: "text",
        required: true,
        showFor: ["Mutasi"],
      },
      {
        name: "tmt_kenaikan",
        label: "TMT Kenaikan",
        type: "date",
        showFor: ["Kenaikan Pangkat", "Mutasi"],
      },
      { name: "nomor_sk", label: "Nomor SK", type: "text" },
      { name: "tanggal_sk", label: "Tanggal SK", type: "date" },
      {
        name: "jenis_cuti",
        label: "Jenis Cuti",
        type: "select",
        required: true,
        showFor: ["Cuti"],
        options: [
          { value: "", label: "Pilih Jenis Cuti" },
          { value: "Tahunan", label: "Tahunan" },
          { value: "Sakit", label: "Sakit" },
          { value: "Besar", label: "Besar" },
          { value: "Melahirkan", label: "Melahirkan" },
          { value: "Alasan Penting", label: "Alasan Penting" },
          {
            value: "Luar Tanggungan Negara",
            label: "Luar Tanggungan Negara",
          },
        ],
      },
      {
        name: "tanggal_mulai_cuti",
        label: "Tanggal Mulai Cuti",
        type: "date",
        required: true,
        showFor: ["Cuti"],
      },
      {
        name: "tanggal_selesai_cuti",
        label: "Tanggal Selesai Cuti",
        type: "date",
        showFor: ["Cuti"],
      },
      {
        name: "lama_cuti",
        label: "Lama Cuti",
        type: "number",
        step: "1",
        readOnly: true,
        showFor: ["Cuti"],
      },
      {
        name: "nilai_skp",
        label: "Nilai SKP",
        type: "number",
        step: "0.01",
        required: true,
        showFor: ["Penilaian Kinerja"],
      },
      {
        name: "predikat_kinerja",
        label: "Predikat Kinerja",
        type: "select",
        required: true,
        showFor: ["Penilaian Kinerja"],
        options: [
          { value: "", label: "Pilih Predikat" },
          { value: "Sangat Baik", label: "Sangat Baik" },
          { value: "Baik", label: "Baik" },
          { value: "Cukup", label: "Cukup" },
          { value: "Kurang", label: "Kurang" },
          { value: "Buruk", label: "Buruk" },
        ],
      },
      {
        name: "jenis_sanksi",
        label: "Jenis Sanksi",
        type: "select",
        showFor: ["Disiplin"],
        options: [
          { value: "", label: "Pilih Jenis Sanksi" },
          { value: "Ringan", label: "Ringan" },
          { value: "Sedang", label: "Sedang" },
          { value: "Berat", label: "Berat" },
        ],
      },
      {
        name: "uraian_sanksi",
        label: "Uraian Sanksi",
        type: "textarea",
        showFor: ["Disiplin"],
        fullWidth: true,
      },
      {
        name: "tanggal_pensiun",
        label: "Tanggal Pensiun",
        type: "date",
        showFor: ["Pensiun"],
      },
      {
        name: "jenis_pensiun",
        label: "Jenis Pensiun",
        type: "select",
        showFor: ["Pensiun"],
        options: [
          { value: "", label: "Pilih Jenis Pensiun" },
          {
            value: "BUP (Batas Usia Pensiun)",
            label: "BUP (Batas Usia Pensiun)",
          },
          {
            value: "Atas Permintaan Sendiri",
            label: "Atas Permintaan Sendiri",
          },
          { value: "Alasan Lain", label: "Alasan Lain" },
        ],
      },
      {
        name: "gaji_pokok",
        label: "Gaji Pokok",
        type: "number",
        step: "0.01",
        showFor: ["Gaji Tunjangan"],
      },
      {
        name: "total_tunjangan",
        label: "Total Tunjangan",
        type: "number",
        step: "0.01",
        showFor: ["Gaji Tunjangan"],
      },
      { name: "file_sk", label: "File SK", type: "text" },
      {
        name: "file_pendukung",
        label: "File Pendukung (JSON Array)",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "proses", label: "Proses" },
          { value: "disetujui", label: "Disetujui" },
          { value: "ditolak", label: "Ditolak" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-keu": [
      {
        name: "unit_kerja",
        label: "Unit Kerja",
        type: "select",
        required: true,
        options: [
          { value: "Sekretariat", label: "Sekretariat" },
          { value: "UPTD", label: "UPTD" },
          { value: "Bidang Ketersediaan", label: "Bidang Ketersediaan" },
          { value: "Bidang Distribusi", label: "Bidang Distribusi" },
          { value: "Bidang Konsumsi", label: "Bidang Konsumsi" },
        ],
      },
      {
        name: "kode_unit",
        label: "Kode Unit",
        type: "text",
        required: true,
      },
      {
        name: "tahun_anggaran",
        label: "Tahun Anggaran",
        type: "number",
        step: "1",
        required: true,
      },
      {
        name: "jenis_layanan_keuangan",
        label: "Jenis Layanan Keuangan",
        type: "select",
        required: true,
        options: [
          { value: "RKA/DPA", label: "RKA/DPA" },
          { value: "Belanja", label: "Belanja" },
          { value: "Pencairan", label: "Pencairan" },
          { value: "SPJ", label: "SPJ" },
          { value: "Laporan", label: "Laporan" },
          { value: "Revisi", label: "Revisi" },
          { value: "Monitoring", label: "Monitoring" },
        ],
      },
      {
        name: "nomor_dpa",
        label: "Nomor DPA",
        type: "text",
        showFor: ["RKA/DPA", "Revisi", "Monitoring"],
      },
      {
        name: "kode_rekening",
        label: "Kode Rekening",
        type: "text",
      },
      {
        name: "nama_rekening",
        label: "Nama Rekening",
        type: "text",
      },
      {
        name: "pagu_anggaran",
        label: "Pagu Anggaran",
        type: "number",
        step: "0.01",
      },
      {
        name: "realisasi",
        label: "Realisasi",
        type: "number",
        step: "0.01",
      },
      {
        name: "sisa_anggaran",
        label: "Sisa Anggaran",
        type: "number",
        step: "0.01",
        readOnly: true,
      },
      {
        name: "persentase_realisasi",
        label: "Persentase Realisasi (%)",
        type: "number",
        step: "0.01",
        readOnly: true,
      },
      {
        name: "jenis_belanja",
        label: "Jenis Belanja",
        type: "select",
        showFor: ["Belanja", "Pencairan", "SPJ"],
        options: [
          { value: "", label: "Pilih Jenis Belanja" },
          { value: "Belanja Pegawai", label: "Belanja Pegawai" },
          { value: "Belanja Barang", label: "Belanja Barang" },
          { value: "Belanja Modal", label: "Belanja Modal" },
        ],
      },
      {
        name: "uraian_belanja",
        label: "Uraian Belanja",
        type: "textarea",
        fullWidth: true,
        showFor: ["Belanja", "Pencairan", "SPJ"],
      },
      {
        name: "keperluan",
        label: "Keperluan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pencairan", "Belanja"],
      },
      {
        name: "penerima_uang",
        label: "Penerima Uang",
        type: "text",
        showFor: ["Pencairan"],
      },
      {
        name: "tanggal_pencairan",
        label: "Tanggal Pencairan",
        type: "date",
        showFor: ["Pencairan"],
      },
      {
        name: "jumlah_pencairan",
        label: "Jumlah Pencairan",
        type: "number",
        step: "0.01",
        showFor: ["Pencairan"],
      },
      {
        name: "nomor_spj",
        label: "Nomor SPJ",
        type: "text",
        showFor: ["SPJ"],
      },
      {
        name: "tanggal_spj",
        label: "Tanggal SPJ",
        type: "date",
        showFor: ["SPJ"],
      },
      {
        name: "status_spj",
        label: "Status SPJ",
        type: "select",
        showFor: ["SPJ"],
        options: [
          { value: "", label: "Pilih Status SPJ" },
          { value: "Belum SPJ", label: "Belum SPJ" },
          { value: "SPJ Lengkap", label: "SPJ Lengkap" },
          { value: "SPJ Kurang", label: "SPJ Kurang" },
          { value: "Diverifikasi", label: "Diverifikasi" },
          { value: "Ditolak", label: "Ditolak" },
        ],
      },
      {
        name: "jenis_revisi",
        label: "Jenis Revisi",
        type: "select",
        showFor: ["Revisi"],
        options: [
          { value: "", label: "Pilih Jenis Revisi" },
          { value: "Revisi Anggaran", label: "Revisi Anggaran" },
          { value: "Pergeseran", label: "Pergeseran" },
          { value: "Tambahan", label: "Tambahan" },
        ],
      },
      {
        name: "alasan_revisi",
        label: "Alasan Revisi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Revisi"],
      },
      {
        name: "file_dpa",
        label: "File DPA",
        type: "text",
      },
      {
        name: "file_spj",
        label: "File SPJ",
        type: "text",
        showFor: ["SPJ"],
      },
      {
        name: "file_bukti",
        label: "File Bukti (JSON Array)",
        type: "textarea",
        fullWidth: true,
        showFor: ["SPJ", "Pencairan"],
      },
      {
        name: "file_laporan",
        label: "File Laporan",
        type: "text",
        showFor: ["Laporan"],
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "proses", label: "Proses" },
          { value: "diverifikasi", label: "Diverifikasi" },
          { value: "disetujui", label: "Disetujui" },
          { value: "ditolak", label: "Ditolak" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-rmh": [
      {
        name: "jenis_layanan_rumah_tangga",
        label: "Jenis Layanan Rumah Tangga",
        type: "select",
        required: true,
        options: [
          { value: "Perjalanan Dinas", label: "Perjalanan Dinas" },
          { value: "Kebersihan", label: "Kebersihan" },
          { value: "Keamanan", label: "Keamanan" },
          { value: "Fasilitas", label: "Fasilitas" },
          { value: "Ruang Rapat", label: "Ruang Rapat" },
          { value: "Kendaraan", label: "Kendaraan" },
        ],
      },
      {
        name: "nomor_sppd",
        label: "Nomor SPPD",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "nomor_st",
        label: "Nomor ST",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "nama_pegawai",
        label: "Nama Pegawai",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "nip_pegawai",
        label: "NIP Pegawai",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "tujuan",
        label: "Tujuan",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "keperluan",
        label: "Keperluan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "tanggal_berangkat",
        label: "Tanggal Berangkat",
        type: "date",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "tanggal_kembali",
        label: "Tanggal Kembali",
        type: "date",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "lama_hari",
        label: "Lama Hari",
        type: "number",
        step: "1",
        readOnly: true,
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "biaya_transport",
        label: "Biaya Transport",
        type: "number",
        step: "0.01",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "biaya_penginapan",
        label: "Biaya Penginapan",
        type: "number",
        step: "0.01",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "uang_harian",
        label: "Uang Harian",
        type: "number",
        step: "0.01",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "total_biaya",
        label: "Total Biaya",
        type: "number",
        step: "0.01",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "area_kebersihan",
        label: "Area Kebersihan",
        type: "text",
        showFor: ["Kebersihan"],
      },
      {
        name: "jadwal_kebersihan",
        label: "Jadwal Kebersihan",
        type: "select",
        showFor: ["Kebersihan"],
        options: [
          { value: "", label: "Pilih Jadwal Kebersihan" },
          { value: "Harian", label: "Harian" },
          { value: "Mingguan", label: "Mingguan" },
          { value: "Bulanan", label: "Bulanan" },
        ],
      },
      {
        name: "petugas_kebersihan",
        label: "Petugas Kebersihan",
        type: "text",
        showFor: ["Kebersihan"],
      },
      {
        name: "pos_keamanan",
        label: "Pos Keamanan",
        type: "text",
        showFor: ["Keamanan"],
      },
      {
        name: "shift_keamanan",
        label: "Shift Keamanan",
        type: "select",
        showFor: ["Keamanan"],
        options: [
          { value: "", label: "Pilih Shift Keamanan" },
          { value: "Pagi", label: "Pagi" },
          { value: "Siang", label: "Siang" },
          { value: "Malam", label: "Malam" },
        ],
      },
      {
        name: "petugas_keamanan",
        label: "Petugas Keamanan",
        type: "text",
        showFor: ["Keamanan"],
      },
      {
        name: "jenis_fasilitas",
        label: "Jenis Fasilitas",
        type: "text",
        showFor: ["Fasilitas"],
      },
      {
        name: "kondisi_fasilitas",
        label: "Kondisi Fasilitas",
        type: "select",
        showFor: ["Fasilitas"],
        options: [
          { value: "", label: "Pilih Kondisi Fasilitas" },
          { value: "Baik", label: "Baik" },
          { value: "Rusak", label: "Rusak" },
          { value: "Perlu Perbaikan", label: "Perlu Perbaikan" },
        ],
      },
      {
        name: "nama_ruang_rapat",
        label: "Nama Ruang Rapat",
        type: "text",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "kapasitas",
        label: "Kapasitas",
        type: "number",
        step: "1",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "tanggal_pemesanan",
        label: "Tanggal Pemesanan",
        type: "date",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "jam_mulai",
        label: "Jam Mulai",
        type: "time",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "jam_selesai",
        label: "Jam Selesai",
        type: "time",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "pemesan",
        label: "Pemesan",
        type: "text",
        showFor: ["Ruang Rapat"],
      },
      {
        name: "nomor_polisi",
        label: "Nomor Polisi",
        type: "text",
        showFor: ["Kendaraan"],
      },
      {
        name: "jenis_kendaraan",
        label: "Jenis Kendaraan",
        type: "select",
        showFor: ["Kendaraan"],
        options: [
          { value: "", label: "Pilih Jenis Kendaraan" },
          { value: "Mobil Dinas", label: "Mobil Dinas" },
          { value: "Motor Dinas", label: "Motor Dinas" },
          { value: "Mobil Operasional", label: "Mobil Operasional" },
        ],
      },
      {
        name: "driver",
        label: "Driver",
        type: "text",
        showFor: ["Kendaraan"],
      },
      {
        name: "tanggal_pakai",
        label: "Tanggal Pakai",
        type: "date",
        showFor: ["Kendaraan"],
      },
      {
        name: "km_awal",
        label: "KM Awal",
        type: "number",
        step: "1",
        showFor: ["Kendaraan"],
      },
      {
        name: "km_akhir",
        label: "KM Akhir",
        type: "number",
        step: "1",
        showFor: ["Kendaraan"],
      },
      {
        name: "bbm_liter",
        label: "BBM (Liter)",
        type: "number",
        step: "0.01",
        showFor: ["Kendaraan"],
      },
      {
        name: "file_sppd",
        label: "File SPPD",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "file_laporan",
        label: "File Laporan",
        type: "text",
        showFor: ["Perjalanan Dinas"],
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "disetujui", label: "Disetujui" },
          { value: "ditolak", label: "Ditolak" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-ast": [
      {
        name: "unit_kerja",
        label: "Unit Kerja",
        type: "select",
        required: true,
        options: [
          { value: "Sekretariat", label: "Sekretariat" },
          { value: "UPTD", label: "UPTD" },
          { value: "Bidang Ketersediaan", label: "Bidang Ketersediaan" },
          { value: "Bidang Distribusi", label: "Bidang Distribusi" },
          { value: "Bidang Konsumsi", label: "Bidang Konsumsi" },
        ],
      },
      {
        name: "layanan_id",
        label: "Layanan",
        type: "select",
        required: true,
        options: [
          { value: "LY023", label: "Inventarisasi BMD" },
          { value: "LY024", label: "Pengadaan & Penerimaan" },
          { value: "LY025", label: "Penatausahaan Aset" },
          { value: "LY026", label: "Pemeliharaan Aset" },
          { value: "LY027", label: "Pengamanan Aset" },
          { value: "LY028", label: "Penghapusan Aset" },
          { value: "LY029", label: "Laporan Aset" },
        ],
      },
      {
        name: "kode_aset",
        label: "Kode Aset",
        type: "text",
      },
      {
        name: "nama_aset",
        label: "Nama Aset",
        type: "text",
        required: true,
      },
      {
        name: "kategori_aset",
        label: "Kategori Aset",
        type: "select",
        required: true,
        options: [
          { value: "Tanah", label: "Tanah" },
          { value: "Peralatan dan Mesin", label: "Peralatan dan Mesin" },
          { value: "Gedung dan Bangunan", label: "Gedung dan Bangunan" },
          {
            value: "Jalan Irigasi dan Jaringan",
            label: "Jalan Irigasi dan Jaringan",
          },
          { value: "Aset Tetap Lainnya", label: "Aset Tetap Lainnya" },
          {
            value: "Konstruksi Dalam Pengerjaan",
            label: "Konstruksi Dalam Pengerjaan",
          },
        ],
      },
      {
        name: "merk_type",
        label: "Merk/Tipe",
        type: "text",
      },
      {
        name: "nomor_seri",
        label: "Nomor Seri",
        type: "text",
      },
      {
        name: "tahun_perolehan",
        label: "Tahun Perolehan",
        type: "number",
        step: "1",
      },
      {
        name: "cara_perolehan",
        label: "Cara Perolehan",
        type: "select",
        options: [
          { value: "", label: "Pilih Cara Perolehan" },
          { value: "Pembelian", label: "Pembelian" },
          { value: "Hibah", label: "Hibah" },
          { value: "Donasi", label: "Donasi" },
          { value: "Transfer", label: "Transfer" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "harga_perolehan",
        label: "Harga Perolehan",
        type: "number",
        step: "0.01",
      },
      {
        name: "nilai_buku",
        label: "Nilai Buku",
        type: "number",
        step: "0.01",
      },
      {
        name: "kondisi",
        label: "Kondisi",
        type: "select",
        required: true,
        options: [
          { value: "Baik", label: "Baik" },
          { value: "Rusak Ringan", label: "Rusak Ringan" },
          { value: "Rusak Berat", label: "Rusak Berat" },
        ],
      },
      {
        name: "status_aset",
        label: "Status Aset",
        type: "select",
        required: true,
        options: [
          { value: "Aktif", label: "Aktif" },
          { value: "Tidak Digunakan", label: "Tidak Digunakan" },
          { value: "Rusak", label: "Rusak" },
          { value: "Dalam Perbaikan", label: "Dalam Perbaikan" },
          { value: "Akan Dihapus", label: "Akan Dihapus" },
          { value: "Dihapuskan", label: "Dihapuskan" },
        ],
      },
      {
        name: "lokasi",
        label: "Lokasi",
        type: "text",
      },
      {
        name: "ruangan",
        label: "Ruangan",
        type: "text",
      },
      {
        name: "penanggung_jawab_aset",
        label: "Penanggung Jawab Aset",
        type: "text",
      },
      {
        name: "qr_code",
        label: "QR Code",
        type: "text",
      },
      {
        name: "tanggal_inventarisasi",
        label: "Tanggal Inventarisasi",
        type: "date",
      },
      {
        name: "tanggal_pemeliharaan_terakhir",
        label: "Tanggal Pemeliharaan Terakhir",
        type: "date",
      },
      {
        name: "tanggal_pemeliharaan_berikutnya",
        label: "Tanggal Pemeliharaan Berikutnya",
        type: "date",
      },
      {
        name: "biaya_pemeliharaan",
        label: "Biaya Pemeliharaan",
        type: "number",
        step: "0.01",
      },
      {
        name: "jenis_pemeliharaan",
        label: "Jenis Pemeliharaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Jenis Pemeliharaan" },
          { value: "Rutin", label: "Rutin" },
          { value: "Berkala", label: "Berkala" },
          { value: "Darurat", label: "Darurat" },
        ],
      },
      {
        name: "alasan_penghapusan",
        label: "Alasan Penghapusan",
        type: "textarea",
        fullWidth: true,
        showForStatusAset: ["Akan Dihapus", "Dihapuskan"],
      },
      {
        name: "tanggal_penghapusan",
        label: "Tanggal Penghapusan",
        type: "date",
        showForStatusAset: ["Akan Dihapus", "Dihapuskan"],
      },
      {
        name: "nomor_sk_penghapusan",
        label: "Nomor SK Penghapusan",
        type: "text",
        showForStatusAset: ["Akan Dihapus", "Dihapuskan"],
      },
      {
        name: "file_foto",
        label: "File Foto",
        type: "text",
      },
      {
        name: "file_bast",
        label: "File BAST",
        type: "text",
      },
      {
        name: "file_sk",
        label: "File SK",
        type: "text",
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-hum": [
      {
        name: "jenis_layanan_humas",
        label: "Jenis Layanan Humas",
        type: "select",
        required: true,
        options: [
          { value: "Protokol", label: "Protokol" },
          { value: "Acara Resmi", label: "Acara Resmi" },
          { value: "Penerimaan Tamu", label: "Penerimaan Tamu" },
          { value: "Publikasi", label: "Publikasi" },
          { value: "Dokumentasi", label: "Dokumentasi" },
        ],
      },
      { name: "nama_kegiatan", label: "Nama Kegiatan", type: "text" },
      {
        name: "jenis_acara",
        label: "Jenis Acara",
        type: "select",
        options: [
          { value: "", label: "Pilih Jenis Acara" },
          { value: "Rapat", label: "Rapat" },
          { value: "Upacara", label: "Upacara" },
          { value: "Kunjungan", label: "Kunjungan" },
          { value: "Sosialisasi", label: "Sosialisasi" },
          { value: "Workshop", label: "Workshop" },
          { value: "Launching", label: "Launching" },
          { value: "Lainnya", label: "Lainnya" },
        ],
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "tanggal_acara",
        label: "Tanggal Acara",
        type: "date",
      },
      {
        name: "waktu_mulai",
        label: "Waktu Mulai",
        type: "time",
      },
      {
        name: "waktu_selesai",
        label: "Waktu Selesai",
        type: "time",
      },
      { name: "tempat", label: "Tempat", type: "text" },
      {
        name: "pimpinan_hadir",
        label: "Pimpinan Hadir",
        type: "text",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "tamu_vip",
        label: "Daftar Tamu VIP",
        type: "textarea",
        fullWidth: true,
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "jumlah_peserta",
        label: "Jumlah Peserta",
        type: "number",
        step: "1",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "rundown_acara",
        label: "Rundown Acara",
        type: "textarea",
        fullWidth: true,
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "mc",
        label: "MC",
        type: "text",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "protokoler",
        label: "Petugas Protokol",
        type: "text",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "nama_tamu",
        label: "Nama Tamu",
        type: "text",
        showFor: ["Penerimaan Tamu"],
      },
      {
        name: "instansi_tamu",
        label: "Instansi Tamu",
        type: "text",
        showFor: ["Penerimaan Tamu"],
      },
      {
        name: "keperluan_kunjungan",
        label: "Keperluan Kunjungan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Penerimaan Tamu"],
      },
      {
        name: "penerima_tamu",
        label: "Penerima Tamu",
        type: "text",
        showFor: ["Penerimaan Tamu"],
      },
      {
        name: "judul_publikasi",
        label: "Judul Publikasi",
        type: "text",
        showFor: ["Publikasi"],
      },
      {
        name: "jenis_publikasi",
        label: "Jenis Publikasi",
        type: "select",
        options: [
          { value: "", label: "Pilih Jenis Publikasi" },
          { value: "Berita", label: "Berita" },
          { value: "Press Release", label: "Press Release" },
          { value: "Artikel", label: "Artikel" },
          { value: "Video", label: "Video" },
          { value: "Foto", label: "Foto" },
          { value: "Infografis", label: "Infografis" },
        ],
        showFor: ["Publikasi"],
      },
      {
        name: "media_publikasi",
        label: "Media Publikasi",
        type: "select",
        options: [
          { value: "", label: "Pilih Media Publikasi" },
          { value: "Website", label: "Website" },
          { value: "Media Sosial", label: "Media Sosial" },
          { value: "Media Massa", label: "Media Massa" },
          { value: "Buletin", label: "Buletin" },
          { value: "Lainnya", label: "Lainnya" },
        ],
        showFor: ["Publikasi"],
      },
      {
        name: "link_publikasi",
        label: "Link Publikasi",
        type: "text",
        showFor: ["Publikasi"],
      },
      {
        name: "isi_publikasi",
        label: "Isi Publikasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Publikasi"],
      },
      {
        name: "fotografer",
        label: "Fotografer",
        type: "text",
        showFor: ["Dokumentasi"],
      },
      {
        name: "videografer",
        label: "Videografer",
        type: "text",
        showFor: ["Dokumentasi"],
      },
      {
        name: "jumlah_foto",
        label: "Jumlah Foto",
        type: "number",
        step: "1",
        showFor: ["Dokumentasi"],
      },
      {
        name: "jumlah_video",
        label: "Jumlah Video",
        type: "number",
        step: "1",
        showFor: ["Dokumentasi"],
      },
      {
        name: "file_foto",
        label: "File Foto (JSON Array)",
        type: "textarea",
        fullWidth: true,
        showFor: ["Dokumentasi"],
      },
      {
        name: "file_video",
        label: "File Video (JSON Array)",
        type: "textarea",
        fullWidth: true,
        showFor: ["Dokumentasi"],
      },
      {
        name: "file_rundown",
        label: "File Rundown",
        type: "text",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "file_undangan",
        label: "File Undangan",
        type: "text",
        showFor: ["Protokol", "Acara Resmi"],
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "persiapan", label: "Persiapan" },
          { value: "berlangsung", label: "Berlangsung" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "sek-kbj": [
      {
        name: "jenis_layanan_kebijakan",
        label: "Jenis Layanan Kebijakan",
        type: "select",
        required: true,
        options: [
          {
            value: "Bahan Kebijakan Teknis",
            label: "Bahan Kebijakan Teknis",
          },
          {
            value: "Rekapitulasi Laporan",
            label: "Rekapitulasi Laporan",
          },
        ],
      },
      { name: "judul", label: "Judul", type: "text", required: true },
      {
        name: "periode",
        label: "Periode",
        type: "text",
        required: true,
      },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        step: "1",
        required: true,
      },
      {
        name: "ruang_lingkup",
        label: "Ruang Lingkup",
        type: "textarea",
        fullWidth: true,
        showFor: ["Bahan Kebijakan Teknis"],
      },
      {
        name: "latar_belakang",
        label: "Latar Belakang",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "analisis",
        label: "Analisis",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "opsi_kebijakan",
        label: "Opsi Kebijakan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Bahan Kebijakan Teknis"],
      },
      {
        name: "rekomendasi_kebijakan",
        label: "Rekomendasi Kebijakan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "dampak",
        label: "Dampak",
        type: "textarea",
        fullWidth: true,
        showFor: ["Bahan Kebijakan Teknis"],
      },
      {
        name: "dasar_hukum",
        label: "Dasar Hukum",
        type: "textarea",
        fullWidth: true,
        showFor: ["Bahan Kebijakan Teknis"],
      },
      {
        name: "sumber_data_bidang_ketersediaan",
        label: "Sumber Data Bidang Ketersediaan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "sumber_data_bidang_distribusi",
        label: "Sumber Data Bidang Distribusi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "sumber_data_bidang_konsumsi",
        label: "Sumber Data Bidang Konsumsi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "sumber_data_uptd",
        label: "Sumber Data UPTD",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "rekapitulasi_keuangan",
        label: "Rekapitulasi Keuangan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "rekapitulasi_program",
        label: "Rekapitulasi Program",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "rekapitulasi_capaian",
        label: "Rekapitulasi Capaian",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekapitulasi Laporan"],
      },
      {
        name: "kesimpulan",
        label: "Kesimpulan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "file_dokumen",
        label: "File Dokumen",
        type: "text",
      },
      {
        name: "file_lampiran",
        label: "File Lampiran (JSON Array)",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "ditujukan_kepada",
        label: "Ditujukan Kepada",
        type: "text",
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "finalisasi", label: "Finalisasi" },
          { value: "disetujui", label: "Disetujui" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-hrg": [
      {
        name: "nama_komoditas",
        label: "Komoditas",
        type: "text",
        required: true,
      },
      { name: "nama_pasar", label: "Nama Pasar", type: "text", required: true },
      {
        name: "tanggal_pantau",
        label: "Tanggal Pantau",
        type: "date",
        required: true,
      },
      { name: "harga", label: "Harga (Rp)", type: "number", required: true },
      {
        name: "satuan",
        label: "Satuan",
        type: "select",
        required: true,
        options: [
          { value: "kg", label: "Kilogram (kg)" },
          { value: "liter", label: "Liter" },
          { value: "butir", label: "Butir" },
          { value: "ikat", label: "Ikat" },
        ],
      },
      {
        name: "tren_harga",
        label: "Tren Harga",
        type: "select",
        required: true,
        options: [
          { value: "Stabil", label: "Stabil" },
          { value: "Naik", label: "Naik" },
          { value: "Turun", label: "Turun" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "publish", label: "Publish" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-kbj": [
      {
        name: "jenis_kebijakan",
        label: "Jenis Kebijakan",
        type: "select",
        required: true,
        options: [
          { value: "Kebijakan Distribusi", label: "Kebijakan Distribusi" },
          { value: "Peta Distribusi", label: "Peta Distribusi" },
          { value: "Penetapan Jalur", label: "Penetapan Jalur" },
          { value: "Sinkronisasi", label: "Sinkronisasi" },
          { value: "Pedoman Teknis", label: "Pedoman Teknis" },
        ],
      },
      { name: "nomor_dokumen", label: "Nomor Dokumen", type: "text" },
      {
        name: "tanggal_dokumen",
        label: "Tanggal Dokumen",
        type: "date",
        required: true,
      },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "judul_kebijakan",
        label: "Judul Kebijakan",
        type: "text",
        required: true,
      },
      {
        name: "latar_belakang",
        label: "Latar Belakang",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "koordinasi_dengan",
        label: "Koordinasi Dengan",
        type: "text",
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "finalisasi", label: "Finalisasi" },
          { value: "disetujui", label: "Disetujui" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-mon": [
      {
        name: "jenis_monitoring",
        label: "Jenis Monitoring",
        type: "select",
        required: true,
        options: [
          { value: "Arus Distribusi", label: "Arus Distribusi" },
          { value: "Stok Pasar", label: "Stok Pasar" },
          { value: "Hambatan Distribusi", label: "Hambatan Distribusi" },
          { value: "Fasilitasi Kelancaran", label: "Fasilitasi Kelancaran" },
          { value: "Koordinasi Wilayah", label: "Koordinasi Wilayah" },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "bulan",
        label: "Bulan",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "nama_komoditas", label: "Komoditas", type: "text" },
      { name: "wilayah_asal", label: "Wilayah Asal", type: "text" },
      { name: "wilayah_tujuan", label: "Wilayah Tujuan", type: "text" },
      {
        name: "volume_distribusi",
        label: "Volume Distribusi",
        type: "number",
        step: "0.01",
      },
      { name: "nama_pasar", label: "Nama Pasar", type: "text" },
      { name: "stok_pasar", label: "Stok Pasar", type: "number", step: "0.01" },
      {
        name: "status_stok",
        label: "Status Stok",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Surplus", label: "Surplus" },
          { value: "Aman", label: "Aman" },
          { value: "Menipis", label: "Menipis" },
          { value: "Kritis", label: "Kritis" },
        ],
      },
      {
        name: "jenis_hambatan",
        label: "Jenis Hambatan",
        type: "select",
        options: [
          { value: "", label: "Pilih Hambatan" },
          { value: "Infrastruktur", label: "Infrastruktur" },
          { value: "Cuaca", label: "Cuaca" },
          { value: "Administrasi", label: "Administrasi" },
          { value: "Keamanan", label: "Keamanan" },
          { value: "Biaya", label: "Biaya" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "tingkat_hambatan",
        label: "Tingkat Hambatan",
        type: "select",
        options: [
          { value: "", label: "Pilih Tingkat" },
          { value: "Ringan", label: "Ringan" },
          { value: "Sedang", label: "Sedang" },
          { value: "Berat", label: "Berat" },
        ],
      },
      {
        name: "status_penanganan",
        label: "Status Penanganan",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Belum Ditangani", label: "Belum Ditangani" },
          { value: "Dalam Proses", label: "Dalam Proses" },
          { value: "Selesai", label: "Selesai" },
        ],
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-cpd": [
      {
        name: "jenis_layanan_cppd",
        label: "Jenis Layanan CPPD",
        type: "select",
        required: true,
        options: [
          { value: "Perencanaan", label: "Perencanaan" },
          { value: "Pengadaan", label: "Pengadaan" },
          { value: "Pengelolaan Stok", label: "Pengelolaan Stok" },
          { value: "Penyaluran Darurat", label: "Penyaluran Darurat" },
          { value: "Evaluasi", label: "Evaluasi" },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      { name: "nama_komoditas", label: "Komoditas", type: "text" },
      {
        name: "kebutuhan_cppd",
        label: "Kebutuhan CPPD",
        type: "number",
        step: "0.01",
      },
      {
        name: "target_stok",
        label: "Target Stok",
        type: "number",
        step: "0.01",
      },
      {
        name: "stok_akhir_bulan",
        label: "Stok Akhir Bulan",
        type: "number",
        step: "0.01",
      },
      {
        name: "status_stok",
        label: "Status Stok",
        type: "select",
        options: [
          { value: "Aman", label: "Aman" },
          { value: "Menipis", label: "Menipis" },
          { value: "Kritis", label: "Kritis" },
        ],
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "approved", label: "Approved" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-bmb": [
      {
        name: "jenis_bimbingan",
        label: "Jenis Bimbingan",
        type: "select",
        required: true,
        options: [
          { value: "Bimtek Distribusi", label: "Bimtek Distribusi" },
          { value: "Bimtek CPPD", label: "Bimtek CPPD" },
          { value: "Supervisi Lapangan", label: "Supervisi Lapangan" },
          { value: "Konsultasi Teknis", label: "Konsultasi Teknis" },
          { value: "Fasilitasi Stakeholder", label: "Fasilitasi Stakeholder" },
        ],
      },
      {
        name: "nama_kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        required: true,
      },
      {
        name: "tanggal_kegiatan",
        label: "Tanggal Kegiatan",
        type: "date",
        required: true,
      },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      { name: "tempat", label: "Tempat", type: "text" },
      {
        name: "jumlah_peserta",
        label: "Jumlah Peserta",
        type: "number",
        step: "1",
      },
      {
        name: "metode_pelaksanaan",
        label: "Metode Pelaksanaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Tatap Muka", label: "Tatap Muka" },
          { value: "Online", label: "Online" },
          { value: "Hybrid", label: "Hybrid" },
          { value: "Kunjungan Lapangan", label: "Kunjungan Lapangan" },
        ],
      },
      {
        name: "materi_bimbingan",
        label: "Materi Bimbingan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "temuan_supervisi",
        label: "Temuan Supervisi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi_supervisi",
        label: "Rekomendasi Supervisi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "jawaban_konsultasi",
        label: "Jawaban Konsultasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "hasil_fasilitasi",
        label: "Hasil Fasilitasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "perencanaan", label: "Perencanaan" },
          { value: "pelaksanaan", label: "Pelaksanaan" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-evl": [
      {
        name: "jenis_evaluasi",
        label: "Jenis Evaluasi",
        type: "select",
        required: true,
        options: [
          { value: "Evaluasi Distribusi", label: "Evaluasi Distribusi" },
          {
            value: "Evaluasi Stabilisasi Harga",
            label: "Evaluasi Stabilisasi Harga",
          },
          { value: "Evaluasi CPPD", label: "Evaluasi CPPD" },
          { value: "Data SAKIP", label: "Data SAKIP" },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      {
        name: "judul_evaluasi",
        label: "Judul Evaluasi",
        type: "text",
        required: true,
      },
      { name: "objek_evaluasi", label: "Objek Evaluasi", type: "text" },
      {
        name: "metode_evaluasi",
        label: "Metode Evaluasi",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Desk Evaluation", label: "Desk Evaluation" },
          { value: "Field Visit", label: "Field Visit" },
          { value: "Survey", label: "Survey" },
          { value: "Interview", label: "Interview" },
          { value: "FGD", label: "FGD" },
          { value: "Kombinasi", label: "Kombinasi" },
        ],
      },
      {
        name: "persentase_capaian",
        label: "Persentase Capaian (%)",
        type: "number",
        step: "0.01",
      },
      {
        name: "temuan_evaluasi",
        label: "Temuan Evaluasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-lap": [
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      {
        name: "judul_laporan",
        label: "Judul Laporan",
        type: "text",
        required: true,
      },
      {
        name: "ringkasan_eksekutif",
        label: "Ringkasan Eksekutif",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "inflasi_pangan",
        label: "Inflasi Pangan (%)",
        type: "number",
        step: "0.01",
      },
      {
        name: "target_inflasi",
        label: "Target Inflasi (%)",
        type: "number",
        step: "0.01",
      },
      {
        name: "status_inflasi",
        label: "Status Inflasi",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "On Target", label: "On Target" },
          { value: "Warning", label: "Warning" },
          { value: "Alert", label: "Alert" },
        ],
      },
      {
        name: "volume_distribusi_total",
        label: "Volume Distribusi Total",
        type: "number",
        step: "0.01",
      },
      { name: "stok_cppd", label: "Stok CPPD", type: "number", step: "0.01" },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-pgd": [
      {
        name: "jenis_pengendalian",
        label: "Jenis Pengendalian",
        type: "select",
        required: true,
        options: [
          { value: "Pemantauan Produksi", label: "Pemantauan Produksi" },
          { value: "Pemantauan Pasokan", label: "Pemantauan Pasokan" },
          { value: "Neraca Pangan", label: "Neraca Pangan" },
          { value: "Early Warning", label: "Early Warning" },
          { value: "Sistem Informasi", label: "Sistem Informasi" },
        ],
      },
      { name: "nama_komoditas", label: "Komoditas", type: "text" },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      { name: "kecamatan", label: "Kecamatan", type: "text" },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "bulan",
        label: "Bulan",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "luas_tanam",
        label: "Luas Tanam (Ha)",
        type: "number",
        step: "0.01",
      },
      {
        name: "luas_panen",
        label: "Luas Panen (Ha)",
        type: "number",
        step: "0.01",
      },
      {
        name: "produktivitas",
        label: "Produktivitas",
        type: "number",
        step: "0.01",
      },
      {
        name: "produksi_total",
        label: "Produksi (Ton)",
        type: "number",
        step: "0.01",
      },
      {
        name: "target_produksi",
        label: "Target Produksi (Ton)",
        type: "number",
        step: "0.01",
      },
      {
        name: "pasokan_lokal",
        label: "Pasokan Lokal",
        type: "number",
        step: "0.01",
      },
      {
        name: "pasokan_luar_daerah",
        label: "Pasokan Luar Daerah",
        type: "number",
        step: "0.01",
      },
      {
        name: "total_pasokan",
        label: "Total Pasokan",
        type: "number",
        step: "0.01",
      },
      {
        name: "konsumsi_estimasi",
        label: "Estimasi Konsumsi",
        type: "number",
        step: "0.01",
      },
      { name: "stok_awal", label: "Stok Awal", type: "number", step: "0.01" },
      { name: "stok_akhir", label: "Stok Akhir", type: "number", step: "0.01" },
      {
        name: "surplus_defisit",
        label: "Surplus/Defisit",
        type: "number",
        step: "0.01",
      },
      {
        name: "status_ketersediaan",
        label: "Status Ketersediaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Surplus", label: "Surplus" },
          { value: "Aman", label: "Aman" },
          { value: "Menipis", label: "Menipis" },
          { value: "Defisit", label: "Defisit" },
        ],
      },
      {
        name: "early_warning_status",
        label: "Status Early Warning",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Normal", label: "Normal" },
          { value: "Waspada", label: "Waspada" },
          { value: "Siaga", label: "Siaga" },
          { value: "Darurat", label: "Darurat" },
        ],
      },
      {
        name: "analisis",
        label: "Analisis",
        type: "textarea",
        fullWidth: true,
      },
      { name: "kendala", label: "Kendala", type: "textarea", fullWidth: true },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "publish", label: "Publish" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-kbj": [
      {
        name: "jenis_kebijakan",
        label: "Jenis Kebijakan",
        type: "select",
        required: true,
        options: [
          { value: "Analisis Ketersediaan", label: "Analisis Ketersediaan" },
          { value: "Rekomendasi", label: "Rekomendasi" },
          {
            value: "Penetapan Komoditas Strategis",
            label: "Penetapan Komoditas Strategis",
          },
          { value: "Pedoman Teknis", label: "Pedoman Teknis" },
          {
            value: "Sinkronisasi Pusat-Daerah",
            label: "Sinkronisasi Pusat-Daerah",
          },
        ],
      },
      { name: "nomor_dokumen", label: "Nomor Dokumen", type: "text" },
      {
        name: "tanggal_dokumen",
        label: "Tanggal Dokumen",
        type: "date",
        required: true,
      },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "judul_kebijakan",
        label: "Judul Kebijakan",
        type: "text",
        required: true,
      },
      {
        name: "latar_belakang",
        label: "Latar Belakang",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        required: true,
        fullWidth: true,
      },
      {
        name: "target_pencapaian",
        label: "Target Pencapaian",
        type: "textarea",
        fullWidth: true,
      },
      { name: "instansi_terkait", label: "Instansi Terkait", type: "text" },
      { name: "koordinasi_dengan", label: "Koordinasi Dengan", type: "text" },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "finalisasi", label: "Finalisasi" },
          { value: "disetujui", label: "Disetujui" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-krw": [
      {
        name: "jenis_kerawanan",
        label: "Jenis Kerawanan",
        type: "select",
        required: true,
        options: [
          { value: "Identifikasi", label: "Identifikasi" },
          { value: "Peta Kerawanan", label: "Peta Kerawanan" },
          { value: "Rencana Aksi", label: "Rencana Aksi" },
          {
            value: "Koordinasi Lintas Sektor",
            label: "Koordinasi Lintas Sektor",
          },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "kabupaten", label: "Kabupaten", type: "text", required: true },
      { name: "kecamatan", label: "Kecamatan", type: "text" },
      { name: "desa", label: "Desa", type: "text" },
      {
        name: "tingkat_kerawanan",
        label: "Tingkat Kerawanan",
        type: "select",
        required: true,
        options: [
          { value: "Prioritas 1", label: "Prioritas 1" },
          { value: "Prioritas 2", label: "Prioritas 2" },
          { value: "Prioritas 3", label: "Prioritas 3" },
          { value: "Prioritas 4", label: "Prioritas 4" },
          { value: "Prioritas 5", label: "Prioritas 5" },
          { value: "Prioritas 6", label: "Prioritas 6" },
        ],
      },
      {
        name: "status_ketersediaan",
        label: "Status Ketersediaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Aman", label: "Aman" },
          { value: "Waspada", label: "Waspada" },
          { value: "Rawan", label: "Rawan" },
          { value: "Sangat Rawan", label: "Sangat Rawan" },
        ],
      },
      {
        name: "jumlah_penduduk",
        label: "Jumlah Penduduk",
        type: "number",
        step: "1",
      },
      { name: "jumlah_kk", label: "Jumlah KK", type: "number", step: "1" },
      {
        name: "jumlah_kk_miskin",
        label: "Jumlah KK Miskin",
        type: "number",
        step: "1",
      },
      {
        name: "penyebab_kerawanan",
        label: "Penyebab Kerawanan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "dampak_kerawanan",
        label: "Dampak Kerawanan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rencana_aksi",
        label: "Rencana Aksi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "target_intervensi",
        label: "Target Intervensi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "anggaran_kebutuhan",
        label: "Anggaran Kebutuhan (Rp)",
        type: "number",
        step: "0.01",
      },
      { name: "sumber_anggaran", label: "Sumber Anggaran", type: "text" },
      { name: "instansi_terkait", label: "Instansi Terkait", type: "text" },
      {
        name: "tindak_lanjut_koordinasi",
        label: "Tindak Lanjut Koordinasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "publish", label: "Publish" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-mev": [
      {
        name: "jenis_monev",
        label: "Jenis Monev",
        type: "select",
        required: true,
        options: [
          { value: "Monev Pelaporan", label: "Monev Pelaporan" },
          {
            value: "Monev Penanganan Kerawanan",
            label: "Monev Penanganan Kerawanan",
          },
          { value: "Laporan Kinerja", label: "Laporan Kinerja" },
          { value: "Laporan Teknis", label: "Laporan Teknis" },
          { value: "Data SAKIP", label: "Data SAKIP" },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      {
        name: "judul_laporan",
        label: "Judul Laporan",
        type: "text",
        required: true,
      },
      { name: "objek_monev", label: "Objek Monev", type: "text" },
      { name: "lokasi_monev", label: "Lokasi Monev", type: "text" },
      { name: "tanggal_monev", label: "Tanggal Monev", type: "date" },
      {
        name: "metode_monev",
        label: "Metode Monev",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Desk Evaluation", label: "Desk Evaluation" },
          { value: "Field Visit", label: "Field Visit" },
          { value: "Survey", label: "Survey" },
          { value: "Interview", label: "Interview" },
          { value: "FGD", label: "FGD" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "program_yang_dimonev",
        label: "Program yang Dimonev",
        type: "text",
      },
      {
        name: "target_kinerja",
        label: "Target Kinerja",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "realisasi_kinerja",
        label: "Realisasi Kinerja",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "persentase_capaian",
        label: "Persentase Capaian (%)",
        type: "number",
        step: "0.01",
      },
      {
        name: "temuan_monev",
        label: "Temuan Monev",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      { name: "ditujukan_kepada", label: "Ditujukan Kepada", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-fsl": [
      {
        name: "jenis_fasilitasi",
        label: "Jenis Fasilitasi",
        type: "select",
        required: true,
        options: [
          { value: "Intervensi Produksi", label: "Intervensi Produksi" },
          {
            value: "Intervensi Distribusi",
            label: "Intervensi Distribusi",
          },
          { value: "Intervensi Konsumsi", label: "Intervensi Konsumsi" },
          { value: "Bantuan Pangan", label: "Bantuan Pangan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "nama_program",
        label: "Nama Program",
        type: "text",
        required: true,
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "wilayah_sasaran",
        label: "Wilayah Sasaran",
        type: "text",
      },
      {
        name: "kelompok_sasaran",
        label: "Kelompok Sasaran",
        type: "text",
      },
      {
        name: "jumlah_penerima",
        label: "Jumlah Penerima",
        type: "number",
        step: "1",
      },
      {
        name: "jenis_intervensi",
        label: "Jenis Intervensi",
        type: "select",
        options: [
          { value: "", label: "Pilih Jenis Intervensi" },
          { value: "Bantuan Benih", label: "Bantuan Benih" },
          { value: "Bantuan Pupuk", label: "Bantuan Pupuk" },
          { value: "Bantuan Alat", label: "Bantuan Alat" },
          { value: "Bantuan Pangan", label: "Bantuan Pangan" },
          { value: "Pelatihan", label: "Pelatihan" },
          { value: "Pendampingan", label: "Pendampingan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "volume_bantuan",
        label: "Volume Bantuan",
        type: "number",
        step: "0.01",
      },
      { name: "satuan", label: "Satuan", type: "text" },
      {
        name: "nilai_bantuan",
        label: "Nilai Bantuan (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "sumber_bantuan",
        label: "Sumber Bantuan",
        type: "text",
      },
      {
        name: "instansi_pemberi",
        label: "Instansi Pemberi",
        type: "text",
      },
      {
        name: "tanggal_penyaluran",
        label: "Tanggal Penyaluran",
        type: "date",
      },
      {
        name: "lokasi_penyaluran",
        label: "Lokasi Penyaluran",
        type: "text",
      },
      {
        name: "penanggung_jawab_penyaluran",
        label: "Penanggung Jawab Penyaluran",
        type: "text",
      },
      {
        name: "target_output",
        label: "Target Output",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "target_outcome",
        label: "Target Outcome",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "realisasi",
        label: "Realisasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "kendala",
        label: "Kendala",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "solusi",
        label: "Solusi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "dampak",
        label: "Dampak",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "perencanaan", label: "Perencanaan" },
          { value: "pelaksanaan", label: "Pelaksanaan" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bkt-bmb": [
      {
        name: "jenis_bimbingan",
        label: "Jenis Bimbingan",
        type: "select",
        required: true,
        options: [
          { value: "Bimtek", label: "Bimtek" },
          { value: "Supervisi", label: "Supervisi" },
          { value: "Pemetaan", label: "Pemetaan" },
          { value: "Pendampingan", label: "Pendampingan" },
          { value: "Konsultasi", label: "Konsultasi" },
        ],
      },
      {
        name: "nama_kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        required: true,
      },
      {
        name: "tanggal_kegiatan",
        label: "Tanggal Kegiatan",
        type: "date",
        required: true,
      },
      { name: "waktu_mulai", label: "Waktu Mulai", type: "time" },
      { name: "waktu_selesai", label: "Waktu Selesai", type: "time" },
      { name: "tempat", label: "Tempat", type: "text" },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      {
        name: "sasaran_peserta",
        label: "Sasaran Peserta",
        type: "text",
      },
      {
        name: "jumlah_peserta",
        label: "Jumlah Peserta",
        type: "number",
        step: "1",
      },
      { name: "narasumber", label: "Narasumber", type: "text" },
      { name: "fasilitator", label: "Fasilitator", type: "text" },
      {
        name: "materi_bimbingan",
        label: "Materi Bimbingan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "metode_pelaksanaan",
        label: "Metode Pelaksanaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Tatap Muka", label: "Tatap Muka" },
          { value: "Online", label: "Online" },
          { value: "Hybrid", label: "Hybrid" },
          {
            value: "Kunjungan Lapangan",
            label: "Kunjungan Lapangan",
          },
        ],
      },
      {
        name: "topik_pemetaan",
        label: "Topik Pemetaan",
        type: "text",
      },
      {
        name: "hasil_pemetaan",
        label: "Hasil Pemetaan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "area_supervisi",
        label: "Area Supervisi",
        type: "text",
      },
      {
        name: "temuan_supervisi",
        label: "Temuan Supervisi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi_supervisi",
        label: "Rekomendasi Supervisi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "topik_konsultasi",
        label: "Topik Konsultasi",
        type: "text",
      },
      {
        name: "pemohon_konsultasi",
        label: "Pemohon Konsultasi",
        type: "text",
      },
      {
        name: "jawaban_konsultasi",
        label: "Jawaban Konsultasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "durasi_pendampingan",
        label: "Durasi Pendampingan",
        type: "text",
      },
      {
        name: "frekuensi_pendampingan",
        label: "Frekuensi Pendampingan",
        type: "number",
        step: "1",
      },
      {
        name: "output_kegiatan",
        label: "Output Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "outcome_kegiatan",
        label: "Outcome Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "evaluasi_kegiatan",
        label: "Evaluasi Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "biaya_kegiatan",
        label: "Biaya Kegiatan (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "sumber_anggaran",
        label: "Sumber Anggaran",
        type: "text",
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      {
        name: "pelaksana",
        label: "Pelaksana",
        type: "text",
        required: true,
      },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "perencanaan", label: "Perencanaan" },
          { value: "pelaksanaan", label: "Pelaksanaan" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-kbj": [
      {
        name: "jenis_kebijakan",
        label: "Jenis Kebijakan",
        type: "select",
        required: true,
        options: [
          { value: "Kebijakan Konsumsi", label: "Kebijakan Konsumsi" },
          { value: "Pedoman B2SA", label: "Pedoman B2SA" },
          {
            value: "Penganekaragaman Pangan",
            label: "Penganekaragaman Pangan",
          },
          { value: "Sinkronisasi", label: "Sinkronisasi" },
          { value: "Rekomendasi Intervensi", label: "Rekomendasi Intervensi" },
        ],
      },
      { name: "nomor_dokumen", label: "Nomor Dokumen", type: "text" },
      {
        name: "tanggal_dokumen",
        label: "Tanggal Dokumen",
        type: "date",
        required: true,
      },
      { name: "periode", label: "Periode", type: "text" },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      {
        name: "judul_kebijakan",
        label: "Judul Kebijakan",
        type: "text",
        required: true,
      },
      {
        name: "latar_belakang",
        label: "Latar Belakang",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "ruang_lingkup",
        label: "Ruang Lingkup",
        type: "textarea",
        fullWidth: true,
      },
      { name: "tujuan", label: "Tujuan", type: "textarea", fullWidth: true },
      { name: "sasaran", label: "Sasaran", type: "textarea", fullWidth: true },
      {
        name: "prinsip_b2sa",
        label: "Prinsip B2SA",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pedoman B2SA"],
      },
      {
        name: "pedoman_b2sa",
        label: "Pedoman B2SA",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pedoman B2SA"],
      },
      {
        name: "skor_pph_target",
        label: "Target Skor PPH",
        type: "number",
        step: "0.01",
      },
      {
        name: "strategi_penganekaragaman",
        label: "Strategi Penganekaragaman",
        type: "textarea",
        fullWidth: true,
        showFor: ["Penganekaragaman Pangan"],
      },
      {
        name: "pangan_lokal_prioritas",
        label: "Pangan Lokal Prioritas",
        type: "textarea",
        fullWidth: true,
        showFor: ["Penganekaragaman Pangan"],
      },
      {
        name: "target_konsumsi_lokal",
        label: "Target Konsumsi Lokal",
        type: "textarea",
        fullWidth: true,
        showFor: ["Penganekaragaman Pangan"],
      },
      {
        name: "intervensi_konsumsi",
        label: "Intervensi Konsumsi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekomendasi Intervensi"],
      },
      {
        name: "kelompok_sasaran",
        label: "Kelompok Sasaran",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "wilayah_prioritas",
        label: "Wilayah Prioritas",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "koordinasi_dengan",
        label: "Koordinasi Dengan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Sinkronisasi"],
      },
      {
        name: "hasil_sinkronisasi",
        label: "Hasil Sinkronisasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Sinkronisasi"],
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "indikator_keberhasilan",
        label: "Indikator Keberhasilan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "target_capaian",
        label: "Target Capaian",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "dasar_hukum",
        label: "Dasar Hukum",
        type: "textarea",
        fullWidth: true,
        showFor: ["Kebijakan Konsumsi", "Pedoman B2SA"],
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      { name: "file_dokumen", label: "File Dokumen", type: "text" },
      {
        name: "file_lampiran",
        label: "File Lampiran (JSON Array)",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "finalisasi", label: "Finalisasi" },
          { value: "disetujui", label: "Disetujui" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-dvr": [
      {
        name: "jenis_kegiatan",
        label: "Jenis Kegiatan",
        type: "select",
        required: true,
        options: [
          {
            value: "Pengembangan Pangan Lokal",
            label: "Pengembangan Pangan Lokal",
          },
          { value: "Pemanfaatan Pekarangan", label: "Pemanfaatan Pekarangan" },
          { value: "Kampanye", label: "Kampanye" },
          { value: "Edukasi B2SA", label: "Edukasi B2SA" },
          { value: "Pendampingan Kelompok", label: "Pendampingan Kelompok" },
        ],
      },
      {
        name: "nama_kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        required: true,
      },
      { name: "tanggal_kegiatan", label: "Tanggal Kegiatan", type: "date" },
      { name: "lokasi_kegiatan", label: "Lokasi Kegiatan", type: "text" },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      { name: "kecamatan", label: "Kecamatan", type: "text" },
      { name: "desa", label: "Desa", type: "text" },
      {
        name: "jenis_pangan_lokal",
        label: "Jenis Pangan Lokal",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pengembangan Pangan Lokal"],
      },
      {
        name: "potensi_pangan_lokal",
        label: "Potensi Pangan Lokal",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pengembangan Pangan Lokal"],
      },
      {
        name: "pengembangan_dilakukan",
        label: "Pengembangan yang Dilakukan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pengembangan Pangan Lokal"],
      },
      {
        name: "hasil_pengembangan",
        label: "Hasil Pengembangan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pengembangan Pangan Lokal"],
      },
      {
        name: "jumlah_kk_pekarangan",
        label: "Jumlah KK Pekarangan",
        type: "number",
        step: "1",
        showFor: ["Pemanfaatan Pekarangan"],
      },
      {
        name: "luas_pekarangan_total",
        label: "Luas Pekarangan Total (Ha)",
        type: "number",
        step: "0.01",
        showFor: ["Pemanfaatan Pekarangan"],
      },
      {
        name: "jenis_tanaman",
        label: "Jenis Tanaman",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pemanfaatan Pekarangan"],
      },
      {
        name: "hasil_panen_pekarangan",
        label: "Hasil Panen Pekarangan",
        type: "number",
        step: "0.01",
        showFor: ["Pemanfaatan Pekarangan"],
      },
      {
        name: "nilai_ekonomi",
        label: "Nilai Ekonomi (Rp)",
        type: "number",
        step: "0.01",
        showFor: ["Pemanfaatan Pekarangan"],
      },
      {
        name: "jenis_kampanye",
        label: "Jenis Kampanye",
        type: "select",
        showFor: ["Kampanye"],
        options: [
          { value: "", label: "Pilih Jenis Kampanye" },
          { value: "Media Massa", label: "Media Massa" },
          { value: "Media Sosial", label: "Media Sosial" },
          { value: "Spanduk", label: "Spanduk" },
          { value: "Leaflet", label: "Leaflet" },
          { value: "Event", label: "Event" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "tema_kampanye",
        label: "Tema Kampanye",
        type: "text",
        showFor: ["Kampanye"],
      },
      {
        name: "pesan_kampanye",
        label: "Pesan Kampanye",
        type: "textarea",
        fullWidth: true,
        showFor: ["Kampanye"],
      },
      {
        name: "jangkauan_kampanye",
        label: "Jangkauan Kampanye (orang)",
        type: "number",
        step: "1",
        showFor: ["Kampanye"],
      },
      {
        name: "materi_edukasi_b2sa",
        label: "Materi Edukasi B2SA",
        type: "textarea",
        fullWidth: true,
        showFor: ["Edukasi B2SA"],
      },
      {
        name: "metode_edukasi",
        label: "Metode Edukasi",
        type: "select",
        showFor: ["Edukasi B2SA"],
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Penyuluhan", label: "Penyuluhan" },
          { value: "Pelatihan", label: "Pelatihan" },
          { value: "Demo Masak", label: "Demo Masak" },
          { value: "Lomba", label: "Lomba" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "sasaran_edukasi",
        label: "Sasaran Edukasi",
        type: "text",
        showFor: ["Edukasi B2SA"],
      },
      {
        name: "jumlah_peserta_edukasi",
        label: "Jumlah Peserta Edukasi",
        type: "number",
        step: "1",
        showFor: ["Edukasi B2SA"],
      },
      {
        name: "nama_kelompok_pangan",
        label: "Nama Kelompok",
        type: "text",
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "jenis_kelompok",
        label: "Jenis Kelompok",
        type: "select",
        showFor: ["Pendampingan Kelompok"],
        options: [
          { value: "", label: "Pilih Jenis Kelompok" },
          { value: "Kelompok Tani", label: "Kelompok Tani" },
          { value: "Kelompok Wanita", label: "Kelompok Wanita" },
          { value: "PKK", label: "PKK" },
          { value: "UMKM", label: "UMKM" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "jumlah_anggota_kelompok",
        label: "Jumlah Anggota",
        type: "number",
        step: "1",
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "kegiatan_kelompok",
        label: "Kegiatan Kelompok",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "frekuensi_pendampingan",
        label: "Frekuensi Pendampingan",
        type: "number",
        step: "1",
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "materi_pendampingan",
        label: "Materi Pendampingan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "produk_kelompok",
        label: "Produk Kelompok",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "omzet_kelompok",
        label: "Omzet Kelompok (Rp)",
        type: "number",
        step: "0.01",
        showFor: ["Pendampingan Kelompok"],
      },
      {
        name: "bantuan_diberikan",
        label: "Bantuan Diberikan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "nilai_bantuan",
        label: "Nilai Bantuan (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "output_kegiatan",
        label: "Output Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "outcome_kegiatan",
        label: "Outcome Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      { name: "dampak", label: "Dampak", type: "textarea", fullWidth: true },
      { name: "kendala", label: "Kendala", type: "textarea", fullWidth: true },
      { name: "solusi", label: "Solusi", type: "textarea", fullWidth: true },
      {
        name: "biaya_kegiatan",
        label: "Biaya Kegiatan (Rp)",
        type: "number",
        step: "0.01",
      },
      { name: "sumber_anggaran", label: "Sumber Anggaran", type: "text" },
      { name: "file_laporan", label: "File Laporan", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "perencanaan", label: "Perencanaan" },
          { value: "pelaksanaan", label: "Pelaksanaan" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-kmn": [
      {
        name: "jenis_kegiatan_keamanan",
        label: "Jenis Kegiatan Keamanan",
        type: "select",
        required: true,
        options: [
          { value: "Pembinaan Pangan Segar", label: "Pembinaan Pangan Segar" },
          {
            value: "Sosialisasi Pangan Aman",
            label: "Sosialisasi Pangan Aman",
          },
          { value: "Fasilitasi PSAT", label: "Fasilitasi PSAT" },
          { value: "Koordinasi Pengawasan", label: "Koordinasi Pengawasan" },
          { value: "Rekomendasi Teknis", label: "Rekomendasi Teknis" },
        ],
      },
      { name: "tanggal_kegiatan", label: "Tanggal Kegiatan", type: "date" },
      { name: "lokasi", label: "Lokasi", type: "text" },
      {
        name: "objek_pembinaan",
        label: "Objek Pembinaan",
        type: "text",
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "jenis_pangan_segar",
        label: "Jenis Pangan Segar",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "aspek_pembinaan",
        label: "Aspek Pembinaan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "jumlah_pelaku_dibina",
        label: "Jumlah Pelaku Dibina",
        type: "number",
        step: "1",
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "hasil_pembinaan",
        label: "Hasil Pembinaan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "tindak_lanjut_pembinaan",
        label: "Tindak Lanjut Pembinaan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pembinaan Pangan Segar"],
      },
      {
        name: "materi_sosialisasi",
        label: "Materi Sosialisasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Sosialisasi Pangan Aman"],
      },
      {
        name: "sasaran_sosialisasi",
        label: "Sasaran Sosialisasi",
        type: "text",
        showFor: ["Sosialisasi Pangan Aman"],
      },
      {
        name: "jumlah_peserta_sosialisasi",
        label: "Jumlah Peserta Sosialisasi",
        type: "number",
        step: "1",
        showFor: ["Sosialisasi Pangan Aman"],
      },
      {
        name: "metode_sosialisasi",
        label: "Metode Sosialisasi",
        type: "select",
        showFor: ["Sosialisasi Pangan Aman"],
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Penyuluhan", label: "Penyuluhan" },
          { value: "Workshop", label: "Workshop" },
          { value: "Seminar", label: "Seminar" },
          { value: "Media Massa", label: "Media Massa" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "psat_nama_usaha",
        label: "Nama Usaha PSAT",
        type: "text",
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "psat_jenis_usaha",
        label: "Jenis Usaha PSAT",
        type: "select",
        showFor: ["Fasilitasi PSAT"],
        options: [
          { value: "", label: "Pilih Jenis Usaha" },
          { value: "Rumah Makan", label: "Rumah Makan" },
          { value: "Katering", label: "Katering" },
          { value: "Jasa Boga", label: "Jasa Boga" },
          { value: "Kantin", label: "Kantin" },
          { value: "Depot", label: "Depot" },
          { value: "Warung Makan", label: "Warung Makan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "psat_alamat",
        label: "Alamat PSAT",
        type: "text",
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "psat_pemilik",
        label: "Pemilik PSAT",
        type: "text",
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "psat_status_sertifikat",
        label: "Status Sertifikat",
        type: "select",
        showFor: ["Fasilitasi PSAT"],
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Belum", label: "Belum" },
          { value: "Proses", label: "Proses" },
          { value: "Sudah", label: "Sudah" },
        ],
      },
      {
        name: "psat_jenis_fasilitasi",
        label: "Jenis Fasilitasi PSAT",
        type: "textarea",
        fullWidth: true,
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "psat_kendala",
        label: "Kendala PSAT",
        type: "textarea",
        fullWidth: true,
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "psat_solusi",
        label: "Solusi PSAT",
        type: "textarea",
        fullWidth: true,
        showFor: ["Fasilitasi PSAT"],
      },
      {
        name: "instansi_koordinasi_pengawasan",
        label: "Instansi Koordinasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Koordinasi Pengawasan"],
      },
      {
        name: "topik_koordinasi",
        label: "Topik Koordinasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Koordinasi Pengawasan"],
      },
      {
        name: "hasil_koordinasi",
        label: "Hasil Koordinasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Koordinasi Pengawasan"],
      },
      {
        name: "tindak_lanjut_koordinasi",
        label: "Tindak Lanjut Koordinasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Koordinasi Pengawasan"],
      },
      {
        name: "tanggal_rapat",
        label: "Tanggal Rapat",
        type: "date",
        showFor: ["Koordinasi Pengawasan"],
      },
      {
        name: "pemohon_rekomendasi",
        label: "Pemohon Rekomendasi",
        type: "text",
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "instansi_pemohon",
        label: "Instansi Pemohon",
        type: "text",
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "analisis_teknis",
        label: "Analisis Teknis",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "rekomendasi_teknis",
        label: "Rekomendasi Teknis",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "dasar_rekomendasi",
        label: "Dasar Rekomendasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "status_rekomendasi",
        label: "Status Rekomendasi",
        type: "select",
        showFor: ["Rekomendasi Teknis"],
        options: [
          { value: "", label: "Pilih Status" },
          { value: "Diproses", label: "Diproses" },
          { value: "Diterbitkan", label: "Diterbitkan" },
          { value: "Ditolak", label: "Ditolak" },
        ],
      },
      {
        name: "nomor_rekomendasi",
        label: "Nomor Rekomendasi",
        type: "text",
        showFor: ["Rekomendasi Teknis"],
      },
      {
        name: "tanggal_rekomendasi",
        label: "Tanggal Rekomendasi",
        type: "date",
        showFor: ["Rekomendasi Teknis"],
      },
      { name: "file_laporan", label: "File Laporan", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "proses", label: "Proses" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-bmb": [
      {
        name: "jenis_kegiatan",
        label: "Jenis Kegiatan",
        type: "select",
        required: true,
        options: [
          { value: "Bimtek Konsumsi", label: "Bimtek Konsumsi" },
          { value: "Bimtek Keamanan Pangan", label: "Bimtek Keamanan Pangan" },
          { value: "Pelatihan Pengolahan", label: "Pelatihan Pengolahan" },
          { value: "Penyuluhan", label: "Penyuluhan" },
          { value: "Konsultasi Teknis", label: "Konsultasi Teknis" },
        ],
      },
      {
        name: "nama_kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        required: true,
      },
      {
        name: "tanggal_kegiatan",
        label: "Tanggal Kegiatan",
        type: "date",
        required: true,
      },
      { name: "waktu_mulai", label: "Waktu Mulai", type: "time" },
      { name: "waktu_selesai", label: "Waktu Selesai", type: "time" },
      { name: "tempat", label: "Tempat", type: "text" },
      { name: "kabupaten", label: "Kabupaten", type: "text" },
      { name: "sasaran_peserta", label: "Sasaran Peserta", type: "text" },
      {
        name: "jumlah_peserta",
        label: "Jumlah Peserta",
        type: "number",
        step: "1",
      },
      { name: "narasumber", label: "Narasumber", type: "text" },
      { name: "fasilitator", label: "Fasilitator", type: "text" },
      {
        name: "materi_bimbingan",
        label: "Materi Bimbingan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "metode_pelaksanaan",
        label: "Metode Pelaksanaan",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Tatap Muka", label: "Tatap Muka" },
          { value: "Online", label: "Online" },
          { value: "Hybrid", label: "Hybrid" },
          { value: "Praktik Langsung", label: "Praktik Langsung" },
        ],
      },
      {
        name: "topik_bimtek_konsumsi",
        label: "Topik Bimtek Konsumsi",
        type: "text",
        showFor: ["Bimtek Konsumsi"],
      },
      {
        name: "topik_bimtek_keamanan",
        label: "Topik Bimtek Keamanan",
        type: "text",
        showFor: ["Bimtek Keamanan Pangan"],
      },
      {
        name: "jenis_pangan_lokal_diolah",
        label: "Jenis Pangan Lokal Diolah",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pelatihan Pengolahan"],
      },
      {
        name: "teknik_pengolahan",
        label: "Teknik Pengolahan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pelatihan Pengolahan"],
      },
      {
        name: "produk_hasil_pelatihan",
        label: "Produk Hasil Pelatihan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Pelatihan Pengolahan"],
      },
      {
        name: "topik_penyuluhan",
        label: "Topik Penyuluhan",
        type: "text",
        showFor: ["Penyuluhan"],
      },
      {
        name: "lokasi_penyuluhan",
        label: "Lokasi Penyuluhan",
        type: "text",
        showFor: ["Penyuluhan"],
      },
      {
        name: "jumlah_sasaran_penyuluhan",
        label: "Jumlah Sasaran Penyuluhan",
        type: "number",
        step: "1",
        showFor: ["Penyuluhan"],
      },
      {
        name: "topik_konsultasi",
        label: "Topik Konsultasi",
        type: "text",
        showFor: ["Konsultasi Teknis"],
      },
      {
        name: "pemohon_konsultasi",
        label: "Pemohon Konsultasi",
        type: "text",
        showFor: ["Konsultasi Teknis"],
      },
      {
        name: "permasalahan_konsultasi",
        label: "Permasalahan Konsultasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Konsultasi Teknis"],
      },
      {
        name: "jawaban_konsultasi",
        label: "Jawaban Konsultasi",
        type: "textarea",
        fullWidth: true,
        showFor: ["Konsultasi Teknis"],
      },
      {
        name: "output_kegiatan",
        label: "Output Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "outcome_kegiatan",
        label: "Outcome Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "evaluasi_kegiatan",
        label: "Evaluasi Kegiatan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "biaya_kegiatan",
        label: "Biaya Kegiatan (Rp)",
        type: "number",
        step: "0.01",
      },
      { name: "sumber_anggaran", label: "Sumber Anggaran", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "perencanaan", label: "Perencanaan" },
          { value: "pelaksanaan", label: "Pelaksanaan" },
          { value: "selesai", label: "Selesai" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-evl": [
      {
        name: "jenis_evaluasi",
        label: "Jenis Evaluasi",
        type: "select",
        required: true,
        options: [
          {
            value: "Evaluasi Program Konsumsi",
            label: "Evaluasi Program Konsumsi",
          },
          {
            value: "Evaluasi Penganekaragaman",
            label: "Evaluasi Penganekaragaman",
          },
          {
            value: "Evaluasi Keamanan Pangan",
            label: "Evaluasi Keamanan Pangan",
          },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      {
        name: "judul_evaluasi",
        label: "Judul Evaluasi",
        type: "text",
        required: true,
      },
      { name: "objek_evaluasi", label: "Objek Evaluasi", type: "text" },
      {
        name: "metode_evaluasi",
        label: "Metode Evaluasi",
        type: "select",
        options: [
          { value: "", label: "Pilih Metode" },
          { value: "Desk Evaluation", label: "Desk Evaluation" },
          { value: "Field Visit", label: "Field Visit" },
          { value: "Survey", label: "Survey" },
          { value: "Interview", label: "Interview" },
          { value: "FGD", label: "FGD" },
          { value: "Kombinasi", label: "Kombinasi" },
        ],
      },
      {
        name: "persentase_capaian",
        label: "Persentase Capaian (%)",
        type: "number",
        step: "0.01",
      },
      {
        name: "skor_pph_capaian",
        label: "Skor PPH Capaian",
        type: "number",
        step: "0.01",
        showFor: ["Evaluasi Program Konsumsi", "Evaluasi Penganekaragaman"],
      },
      {
        name: "skor_pph_target",
        label: "Target Skor PPH",
        type: "number",
        step: "0.01",
        showFor: ["Evaluasi Program Konsumsi", "Evaluasi Penganekaragaman"],
      },
      {
        name: "temuan_evaluasi",
        label: "Temuan Evaluasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "anggaran_program",
        label: "Anggaran Program (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "realisasi_anggaran",
        label: "Realisasi Anggaran (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "persentase_serapan",
        label: "Persentase Serapan (%)",
        type: "number",
        step: "0.01",
        readOnly: true,
      },
      { name: "file_laporan", label: "File Laporan", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bks-lap": [
      {
        name: "jenis_laporan",
        label: "Jenis Laporan",
        type: "select",
        required: true,
        options: [
          { value: "Laporan Kinerja", label: "Laporan Kinerja" },
          { value: "Data SAKIP", label: "Data SAKIP" },
        ],
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "tahun",
        label: "Tahun",
        type: "number",
        required: true,
        step: "1",
      },
      { name: "bulan", label: "Bulan", type: "number", step: "1" },
      {
        name: "judul_laporan",
        label: "Judul Laporan",
        type: "text",
        required: true,
      },
      {
        name: "ringkasan_eksekutif",
        label: "Ringkasan Eksekutif",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "capaian_konsumsi_pangan",
        label: "Capaian Konsumsi Pangan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Laporan Kinerja"],
      },
      {
        name: "capaian_penganekaragaman",
        label: "Capaian Penganekaragaman",
        type: "textarea",
        fullWidth: true,
        showFor: ["Laporan Kinerja"],
      },
      {
        name: "capaian_keamanan_pangan",
        label: "Capaian Keamanan Pangan",
        type: "textarea",
        fullWidth: true,
        showFor: ["Laporan Kinerja"],
      },
      {
        name: "skor_pph",
        label: "Skor PPH",
        type: "number",
        step: "0.01",
        showFor: ["Laporan Kinerja"],
      },
      {
        name: "target_pph",
        label: "Target PPH",
        type: "number",
        step: "0.01",
        showFor: ["Laporan Kinerja"],
      },
      {
        name: "status_pph",
        label: "Status PPH",
        type: "select",
        showFor: ["Laporan Kinerja"],
        options: [
          { value: "", label: "Pilih Status" },
          { value: "On Target", label: "On Target" },
          { value: "Di Bawah Target", label: "Di Bawah Target" },
        ],
      },
      {
        name: "data_sakip_ikk",
        label: "IKK SAKIP",
        type: "textarea",
        fullWidth: true,
        showFor: ["Data SAKIP"],
      },
      {
        name: "data_sakip_capaian",
        label: "Capaian IKK (%)",
        type: "number",
        step: "0.01",
        showFor: ["Data SAKIP"],
      },
      {
        name: "data_sakip_target",
        label: "Target IKK (%)",
        type: "number",
        step: "0.01",
        showFor: ["Data SAKIP"],
      },
      {
        name: "anggaran_program",
        label: "Anggaran Program (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "realisasi_anggaran",
        label: "Realisasi Anggaran (Rp)",
        type: "number",
        step: "0.01",
      },
      {
        name: "persentase_serapan",
        label: "Persentase Serapan (%)",
        type: "number",
        step: "0.01",
        readOnly: true,
      },
      {
        name: "permasalahan",
        label: "Permasalahan",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "rekomendasi",
        label: "Rekomendasi",
        type: "textarea",
        fullWidth: true,
      },
      {
        name: "tindak_lanjut",
        label: "Tindak Lanjut",
        type: "textarea",
        fullWidth: true,
      },
      { name: "file_laporan", label: "File Laporan", type: "text" },
      {
        name: "penanggung_jawab",
        label: "Penanggung Jawab",
        type: "text",
        required: true,
      },
      { name: "pelaksana", label: "Pelaksana", type: "text", required: true },
      {
        name: "is_sensitive",
        label: "Sensitivitas Data",
        type: "select",
        required: true,
        options: [
          { value: "Biasa", label: "Biasa" },
          { value: "Sensitif", label: "Sensitif" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
  };

  const fields = commonFields[moduleId] || [
    { name: "status", label: "Status", type: "text" },
  ];

  if (moduleId === "sek-kep") {
    const layananAktif = formData.jenis_layanan_kepegawaian;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(layananAktif),
    );
  }

  if (moduleId === "sek-keu") {
    const layananAktif = formData.jenis_layanan_keuangan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(layananAktif),
    );
  }

  if (moduleId === "sek-rmh") {
    const layananAktif = formData.jenis_layanan_rumah_tangga;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(layananAktif),
    );
  }

  if (moduleId === "sek-ast") {
    const statusAset = formData.status_aset;
    return fields.filter(
      (field) =>
        !field.showForStatusAset ||
        field.showForStatusAset.includes(statusAset),
    );
  }

  if (moduleId === "sek-hum") {
    const layananAktif = formData.jenis_layanan_humas;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(layananAktif),
    );
  }

  if (moduleId === "sek-kbj") {
    const layananAktif = formData.jenis_layanan_kebijakan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(layananAktif),
    );
  }

  if (moduleId === "bks-kbj") {
    const jenis = formData.jenis_kebijakan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  if (moduleId === "bks-dvr") {
    const jenis = formData.jenis_kegiatan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  if (moduleId === "bks-kmn") {
    const jenis = formData.jenis_kegiatan_keamanan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  if (moduleId === "bks-bmb") {
    const jenis = formData.jenis_kegiatan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  if (moduleId === "bks-evl") {
    const jenis = formData.jenis_evaluasi;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  if (moduleId === "bks-lap") {
    const jenis = formData.jenis_laporan;
    return fields.filter(
      (field) => !field.showFor || field.showFor.includes(jenis),
    );
  }

  return fields;
}

function validateSekKepForm(formData) {
  if (!formData.asn_id || !formData.nip || !formData.nama_asn) {
    return "ASN, NIP, dan Nama ASN wajib diisi.";
  }

  if (!formData.jenis_layanan_kepegawaian) {
    return "Jenis Layanan wajib dipilih.";
  }

  if (
    formData.jenis_layanan_kepegawaian === "Kenaikan Pangkat" &&
    (!formData.pangkat_baru || !formData.golongan_baru)
  ) {
    return "Untuk Kenaikan Pangkat, Pangkat Baru dan Golongan Baru wajib diisi.";
  }

  if (
    formData.jenis_layanan_kepegawaian === "Mutasi" &&
    (!formData.jabatan_baru || !formData.tmt_kenaikan)
  ) {
    return "Untuk Mutasi, Jabatan Baru dan TMT wajib diisi.";
  }

  if (
    formData.jenis_layanan_kepegawaian === "Cuti" &&
    (!formData.jenis_cuti || !formData.tanggal_mulai_cuti)
  ) {
    return "Untuk Cuti, Jenis Cuti dan Tanggal Mulai wajib diisi.";
  }

  if (
    formData.jenis_layanan_kepegawaian === "Penilaian Kinerja" &&
    (!formData.nilai_skp || !formData.predikat_kinerja)
  ) {
    return "Untuk Penilaian Kinerja, Nilai SKP dan Predikat wajib diisi.";
  }

  return null;
}

function validateSekKeuForm(formData) {
  if (
    !formData.unit_kerja ||
    !formData.kode_unit ||
    !formData.tahun_anggaran ||
    !formData.jenis_layanan_keuangan
  ) {
    return "Unit kerja, kode unit, tahun anggaran, dan jenis layanan keuangan wajib diisi.";
  }

  if (!formData.penanggung_jawab || !formData.pelaksana) {
    return "Penanggung jawab dan pelaksana wajib diisi.";
  }

  if (!formData.status) {
    return "Status wajib dipilih.";
  }

  if (
    formData.jenis_layanan_keuangan === "Pencairan" &&
    (!formData.tanggal_pencairan || !formData.jumlah_pencairan)
  ) {
    return "Untuk layanan Pencairan, tanggal dan jumlah pencairan wajib diisi.";
  }

  if (
    formData.jenis_layanan_keuangan === "SPJ" &&
    (!formData.nomor_spj || !formData.status_spj)
  ) {
    return "Untuk layanan SPJ, nomor SPJ dan status SPJ wajib diisi.";
  }

  if (
    formData.jenis_layanan_keuangan === "Revisi" &&
    (!formData.jenis_revisi || !formData.alasan_revisi)
  ) {
    return "Untuk layanan Revisi, jenis revisi dan alasan revisi wajib diisi.";
  }

  return null;
}

function validateSekAstForm(formData) {
  if (!formData.layanan_id || !formData.nama_aset || !formData.kategori_aset) {
    return "Layanan, nama aset, dan kategori aset wajib diisi.";
  }

  if (!formData.kondisi || !formData.status_aset) {
    return "Kondisi dan status aset wajib dipilih.";
  }

  if (!formData.penanggung_jawab || !formData.pelaksana) {
    return "Penanggung jawab dan pelaksana wajib diisi.";
  }

  if (
    ["Akan Dihapus", "Dihapuskan"].includes(formData.status_aset) &&
    !formData.alasan_penghapusan
  ) {
    return "Alasan penghapusan wajib diisi untuk status aset yang akan/dihapuskan.";
  }

  if (formData.tahun_perolehan) {
    const tahun = Number.parseInt(formData.tahun_perolehan, 10);
    const tahunMaks = new Date().getFullYear() + 1;
    if (Number.isNaN(tahun) || tahun < 1900 || tahun > tahunMaks) {
      return `Tahun perolehan harus berada di rentang 1900-${tahunMaks}.`;
    }
  }

  return null;
}

function validateSekRmhForm(formData) {
  if (!formData.jenis_layanan_rumah_tangga) {
    return "Jenis layanan rumah tangga wajib dipilih.";
  }

  if (!formData.penanggung_jawab || !formData.pelaksana) {
    return "Penanggung jawab dan pelaksana wajib diisi.";
  }

  if (!formData.status) {
    return "Status wajib dipilih.";
  }

  if (
    formData.jenis_layanan_rumah_tangga === "Perjalanan Dinas" &&
    (!formData.nama_pegawai ||
      !formData.tanggal_berangkat ||
      !formData.tanggal_kembali)
  ) {
    return "Untuk Perjalanan Dinas, nama pegawai dan tanggal berangkat/kembali wajib diisi.";
  }

  if (
    formData.jenis_layanan_rumah_tangga === "Ruang Rapat" &&
    !formData.nama_ruang_rapat
  ) {
    return "Untuk Ruang Rapat, nama ruang rapat wajib diisi.";
  }

  if (
    formData.jenis_layanan_rumah_tangga === "Kendaraan" &&
    !formData.nomor_polisi
  ) {
    return "Untuk Kendaraan, nomor polisi wajib diisi.";
  }

  return null;
}

function validateSekHumForm(formData) {
  if (!formData.jenis_layanan_humas) {
    return "Jenis layanan humas wajib dipilih.";
  }

  if (!formData.penanggung_jawab || !formData.pelaksana) {
    return "Penanggung jawab dan pelaksana wajib diisi.";
  }

  if (!formData.status) {
    return "Status wajib dipilih.";
  }

  return null;
}

function validateSekKbjForm(formData) {
  if (
    !formData.jenis_layanan_kebijakan ||
    !formData.judul ||
    !formData.periode ||
    !formData.tahun
  ) {
    return "Jenis layanan kebijakan, judul, periode, dan tahun wajib diisi.";
  }

  if (!formData.penanggung_jawab || !formData.pelaksana) {
    return "Penanggung jawab dan pelaksana wajib diisi.";
  }

  if (!formData.status) {
    return "Status wajib dipilih.";
  }

  return null;
}

function buildSubmitPayload(moduleId, formData) {
  if (moduleId === "sek-kep") {
    return {
      ...formData,
      layanan_id:
        SEK_KEP_LAYANAN_MAP[formData.jenis_layanan_kepegawaian] ||
        formData.layanan_id ||
        "LY008",
      asn_id: parseIntegerField(formData.asn_id),
      lama_cuti: parseIntegerField(formData.lama_cuti),
      nilai_skp: parseDecimalField(formData.nilai_skp),
      gaji_pokok: parseDecimalField(formData.gaji_pokok),
      total_tunjangan: parseDecimalField(formData.total_tunjangan),
      file_pendukung: parseJsonField(formData.file_pendukung),
    };
  }

  if (moduleId === "sek-keu") {
    return {
      ...formData,
      layanan_id:
        SEK_KEU_LAYANAN_MAP[formData.jenis_layanan_keuangan] ||
        formData.layanan_id ||
        "LY016",
      tahun_anggaran: parseIntegerField(formData.tahun_anggaran),
      pagu_anggaran: parseDecimalField(formData.pagu_anggaran),
      realisasi: parseDecimalField(formData.realisasi),
      sisa_anggaran: parseDecimalField(formData.sisa_anggaran),
      persentase_realisasi: parseDecimalField(formData.persentase_realisasi),
      jumlah_pencairan: parseDecimalField(formData.jumlah_pencairan),
      file_bukti: parseJsonField(formData.file_bukti),
    };
  }

  if (moduleId === "sek-ast") {
    return {
      ...formData,
      tahun_perolehan: parseIntegerField(formData.tahun_perolehan),
      harga_perolehan: parseDecimalField(formData.harga_perolehan),
      nilai_buku: parseDecimalField(formData.nilai_buku),
      biaya_pemeliharaan: parseDecimalField(formData.biaya_pemeliharaan),
    };
  }

  if (moduleId === "sek-rmh") {
    const layananAktif = formData.jenis_layanan_rumah_tangga;
    const isPerjalanan = layananAktif === "Perjalanan Dinas";
    const isKebersihan = layananAktif === "Kebersihan";
    const isKeamanan = layananAktif === "Keamanan";
    const isFasilitas = layananAktif === "Fasilitas";
    const isRuangRapat = layananAktif === "Ruang Rapat";
    const isKendaraan = layananAktif === "Kendaraan";

    return {
      ...formData,
      layanan_id:
        SEK_RMH_LAYANAN_MAP[formData.jenis_layanan_rumah_tangga] ||
        formData.layanan_id ||
        "LY007",
      nomor_sppd: isPerjalanan ? formData.nomor_sppd || null : null,
      nomor_st: isPerjalanan ? formData.nomor_st || null : null,
      nama_pegawai: isPerjalanan ? formData.nama_pegawai || null : null,
      nip_pegawai: isPerjalanan ? formData.nip_pegawai || null : null,
      tujuan: isPerjalanan ? formData.tujuan || null : null,
      keperluan: isPerjalanan ? formData.keperluan || null : null,
      tanggal_berangkat: isPerjalanan
        ? formData.tanggal_berangkat || null
        : null,
      tanggal_kembali: isPerjalanan ? formData.tanggal_kembali || null : null,
      lama_hari: isPerjalanan ? parseIntegerField(formData.lama_hari) : null,
      biaya_transport: isPerjalanan
        ? parseDecimalField(formData.biaya_transport)
        : null,
      biaya_penginapan: isPerjalanan
        ? parseDecimalField(formData.biaya_penginapan)
        : null,
      uang_harian: isPerjalanan
        ? parseDecimalField(formData.uang_harian)
        : null,
      total_biaya: isPerjalanan
        ? parseDecimalField(formData.total_biaya)
        : null,
      area_kebersihan: isKebersihan ? formData.area_kebersihan || null : null,
      jadwal_kebersihan: isKebersihan
        ? formData.jadwal_kebersihan || null
        : null,
      petugas_kebersihan: isKebersihan
        ? formData.petugas_kebersihan || null
        : null,
      pos_keamanan: isKeamanan ? formData.pos_keamanan || null : null,
      shift_keamanan: isKeamanan ? formData.shift_keamanan || null : null,
      petugas_keamanan: isKeamanan ? formData.petugas_keamanan || null : null,
      jenis_fasilitas: isFasilitas ? formData.jenis_fasilitas || null : null,
      kondisi_fasilitas: isFasilitas
        ? formData.kondisi_fasilitas || null
        : null,
      nama_ruang_rapat: isRuangRapat ? formData.nama_ruang_rapat || null : null,
      kapasitas: isRuangRapat ? parseIntegerField(formData.kapasitas) : null,
      tanggal_pemesanan: isRuangRapat
        ? formData.tanggal_pemesanan || null
        : null,
      jam_mulai: isRuangRapat ? formData.jam_mulai || null : null,
      jam_selesai: isRuangRapat ? formData.jam_selesai || null : null,
      pemesan: isRuangRapat ? formData.pemesan || null : null,
      nomor_polisi: isKendaraan ? formData.nomor_polisi || null : null,
      jenis_kendaraan: isKendaraan ? formData.jenis_kendaraan || null : null,
      driver: isKendaraan ? formData.driver || null : null,
      tanggal_pakai: isKendaraan ? formData.tanggal_pakai || null : null,
      km_awal: isKendaraan ? parseIntegerField(formData.km_awal) : null,
      km_akhir: isKendaraan ? parseIntegerField(formData.km_akhir) : null,
      bbm_liter: isKendaraan ? parseDecimalField(formData.bbm_liter) : null,
      file_sppd: isPerjalanan ? formData.file_sppd || null : null,
      file_laporan: isPerjalanan ? formData.file_laporan || null : null,
    };
  }

  if (moduleId === "sek-hum") {
    return {
      ...formData,
      layanan_id:
        SEK_HUM_LAYANAN_MAP[formData.jenis_layanan_humas] ||
        formData.layanan_id ||
        "LY035",
      jumlah_peserta: parseIntegerField(formData.jumlah_peserta),
      jumlah_foto: parseIntegerField(formData.jumlah_foto),
      jumlah_video: parseIntegerField(formData.jumlah_video),
      file_foto: parseJsonField(formData.file_foto),
      file_video: parseJsonField(formData.file_video),
    };
  }

  if (moduleId === "sek-kbj") {
    return {
      ...formData,
      layanan_id:
        SEK_KBJ_LAYANAN_MAP[formData.jenis_layanan_kebijakan] ||
        formData.layanan_id ||
        "LY046",
      tahun: parseIntegerField(formData.tahun),
      file_lampiran: parseJsonField(formData.file_lampiran),
    };
  }

  if (moduleId === "bds-hrg") {
    return {
      ...formData,
      layanan_id:
        BDS_HRG_LAYANAN_MAP[formData.jenis_layanan_harga] ||
        formData.layanan_id ||
        "LY087",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      harga: parseDecimalField(formData.harga),
      harga_bulan_lalu: parseDecimalField(formData.harga_bulan_lalu),
      perubahan_harga: parseDecimalField(formData.perubahan_harga),
      persentase_perubahan: parseDecimalField(formData.persentase_perubahan),
      harga_pasar_normal: parseDecimalField(formData.harga_pasar_normal),
      harga_operasi_pasar: parseDecimalField(formData.harga_operasi_pasar),
      subsidi_per_unit: parseDecimalField(formData.subsidi_per_unit),
      volume_operasi_pasar: parseDecimalField(formData.volume_operasi_pasar),
      jumlah_pembeli: parseIntegerField(formData.jumlah_pembeli),
      total_nilai_subsidi: parseDecimalField(formData.total_nilai_subsidi),
      inflasi_pangan: parseDecimalField(formData.inflasi_pangan),
      target_inflasi_tpid: parseDecimalField(formData.target_inflasi_tpid),
    };
  }

  if (moduleId === "bds-kbj") {
    return {
      ...formData,
      layanan_id:
        BDS_KBJ_LAYANAN_MAP[formData.jenis_kebijakan] ||
        formData.layanan_id ||
        "LY077",
      tahun: parseIntegerField(formData.tahun),
    };
  }

  if (moduleId === "bds-mon") {
    return {
      ...formData,
      layanan_id:
        BDS_MON_LAYANAN_MAP[formData.jenis_monitoring] ||
        formData.layanan_id ||
        "LY082",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      frekuensi_distribusi: parseIntegerField(formData.frekuensi_distribusi),
      volume_distribusi: parseDecimalField(formData.volume_distribusi),
      stok_pasar: parseDecimalField(formData.stok_pasar),
      stok_normal: parseDecimalField(formData.stok_normal),
    };
  }

  if (moduleId === "bds-cpd") {
    return {
      ...formData,
      layanan_id:
        BDS_CPD_LAYANAN_MAP[formData.jenis_layanan_cppd] ||
        formData.layanan_id ||
        "LY092",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      kebutuhan_cppd: parseDecimalField(formData.kebutuhan_cppd),
      target_stok: parseDecimalField(formData.target_stok),
      kapasitas_gudang: parseDecimalField(formData.kapasitas_gudang),
      rencana_pengadaan: parseDecimalField(formData.rencana_pengadaan),
      volume_pengadaan: parseDecimalField(formData.volume_pengadaan),
      harga_satuan: parseDecimalField(formData.harga_satuan),
      total_nilai: parseDecimalField(formData.total_nilai),
      stok_awal_bulan: parseDecimalField(formData.stok_awal_bulan),
      penerimaan_bulan_ini: parseDecimalField(formData.penerimaan_bulan_ini),
      penyaluran_bulan_ini: parseDecimalField(formData.penyaluran_bulan_ini),
      stok_akhir_bulan: parseDecimalField(formData.stok_akhir_bulan),
      persentase_terhadap_target: parseDecimalField(
        formData.persentase_terhadap_target,
      ),
      suhu_gudang: parseDecimalField(formData.suhu_gudang),
      kelembaban_gudang: parseDecimalField(formData.kelembaban_gudang),
      volume_penyaluran: parseDecimalField(formData.volume_penyaluran),
      jumlah_penerima_manfaat: parseIntegerField(
        formData.jumlah_penerima_manfaat,
      ),
    };
  }

  if (moduleId === "bds-bmb") {
    return {
      ...formData,
      layanan_id:
        BDS_BMB_LAYANAN_MAP[formData.jenis_bimbingan] ||
        formData.layanan_id ||
        "LY097",
      jumlah_peserta: parseIntegerField(formData.jumlah_peserta),
      biaya_kegiatan: parseDecimalField(formData.biaya_kegiatan),
    };
  }

  if (moduleId === "bds-evl") {
    return {
      ...formData,
      layanan_id:
        BDS_EVL_LAYANAN_MAP[formData.jenis_evaluasi] ||
        formData.layanan_id ||
        "LY102",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      triwulan: parseIntegerField(formData.triwulan),
      semester: parseIntegerField(formData.semester),
      persentase_capaian: parseDecimalField(formData.persentase_capaian),
      data_sakip_capaian: parseDecimalField(formData.data_sakip_capaian),
      data_sakip_target: parseDecimalField(formData.data_sakip_target),
      anggaran_program: parseDecimalField(formData.anggaran_program),
      realisasi_anggaran: parseDecimalField(formData.realisasi_anggaran),
      persentase_serapan: parseDecimalField(formData.persentase_serapan),
    };
  }

  if (moduleId === "bds-lap") {
    return {
      ...formData,
      layanan_id: formData.layanan_id || "LY106",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      triwulan: parseIntegerField(formData.triwulan),
      semester: parseIntegerField(formData.semester),
      inflasi_pangan: parseDecimalField(formData.inflasi_pangan),
      target_inflasi: parseDecimalField(formData.target_inflasi),
      volume_distribusi_total: parseDecimalField(
        formData.volume_distribusi_total,
      ),
      stok_cppd: parseDecimalField(formData.stok_cppd),
      operasi_pasar_dilakukan: parseIntegerField(
        formData.operasi_pasar_dilakukan,
      ),
      rapat_tpid_dilakukan: parseIntegerField(formData.rapat_tpid_dilakukan),
      anggaran_program: parseDecimalField(formData.anggaran_program),
      realisasi_anggaran: parseDecimalField(formData.realisasi_anggaran),
      persentase_serapan: parseDecimalField(formData.persentase_serapan),
    };
  }

  if (moduleId === "bkt-fsl") {
    return {
      ...formData,
      layanan_id:
        BKT_FSL_LAYANAN_MAP[formData.jenis_fasilitasi] ||
        formData.layanan_id ||
        "LY066",
      tahun: parseIntegerField(formData.tahun),
      jumlah_penerima: parseIntegerField(formData.jumlah_penerima),
      volume_bantuan: parseDecimalField(formData.volume_bantuan),
      nilai_bantuan: parseDecimalField(formData.nilai_bantuan),
    };
  }

  if (moduleId === "bkt-bmb") {
    return {
      ...formData,
      layanan_id:
        BKT_BMB_LAYANAN_MAP[formData.jenis_bimbingan] ||
        formData.layanan_id ||
        "LY067",
      jumlah_peserta: parseIntegerField(formData.jumlah_peserta),
      frekuensi_pendampingan: parseIntegerField(
        formData.frekuensi_pendampingan,
      ),
      biaya_kegiatan: parseDecimalField(formData.biaya_kegiatan),
    };
  }

  if (moduleId === "bkt-kbj") {
    return {
      ...formData,
      layanan_id:
        BKT_KBJ_LAYANAN_MAP[formData.jenis_kebijakan] ||
        formData.layanan_id ||
        "LY052",
      tahun: parseIntegerField(formData.tahun),
    };
  }

  if (moduleId === "bkt-pgd") {
    return {
      ...formData,
      layanan_id:
        BKT_PGD_LAYANAN_MAP[formData.jenis_pengendalian] ||
        formData.layanan_id ||
        "LY057",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      luas_tanam: parseDecimalField(formData.luas_tanam),
      luas_panen: parseDecimalField(formData.luas_panen),
      produktivitas: parseDecimalField(formData.produktivitas),
      produksi_total: parseDecimalField(formData.produksi_total),
      target_produksi: parseDecimalField(formData.target_produksi),
      pasokan_lokal: parseDecimalField(formData.pasokan_lokal),
      pasokan_luar_daerah: parseDecimalField(formData.pasokan_luar_daerah),
      total_pasokan: parseDecimalField(formData.total_pasokan),
      konsumsi_estimasi: parseDecimalField(formData.konsumsi_estimasi),
      stok_awal: parseDecimalField(formData.stok_awal),
      stok_akhir: parseDecimalField(formData.stok_akhir),
      surplus_defisit: parseDecimalField(formData.surplus_defisit),
    };
  }

  if (moduleId === "bkt-krw") {
    return {
      ...formData,
      layanan_id:
        BKT_KRW_LAYANAN_MAP[formData.jenis_kerawanan] ||
        formData.layanan_id ||
        "LY062",
      tahun: parseIntegerField(formData.tahun),
      jumlah_penduduk: parseIntegerField(formData.jumlah_penduduk),
      jumlah_kk: parseIntegerField(formData.jumlah_kk),
      jumlah_kk_miskin: parseIntegerField(formData.jumlah_kk_miskin),
      anggaran_kebutuhan: parseDecimalField(formData.anggaran_kebutuhan),
    };
  }

  if (moduleId === "bkt-mev") {
    return {
      ...formData,
      layanan_id:
        BKT_MEV_LAYANAN_MAP[formData.jenis_monev] ||
        formData.layanan_id ||
        "LY072",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      persentase_capaian: parseDecimalField(formData.persentase_capaian),
    };
  }

  if (moduleId === "bks-kbj") {
    return {
      ...formData,
      layanan_id:
        BKS_KBJ_LAYANAN_MAP[formData.jenis_kebijakan] ||
        formData.layanan_id ||
        "LY107",
      tahun: parseIntegerField(formData.tahun),
      skor_pph_target: parseDecimalField(formData.skor_pph_target),
      file_lampiran: parseJsonField(formData.file_lampiran),
    };
  }

  if (moduleId === "bks-dvr") {
    return {
      ...formData,
      layanan_id:
        BKS_DVR_LAYANAN_MAP[formData.jenis_kegiatan] ||
        formData.layanan_id ||
        "LY112",
      jumlah_kk_pekarangan: parseIntegerField(formData.jumlah_kk_pekarangan),
      luas_pekarangan_total: parseDecimalField(formData.luas_pekarangan_total),
      hasil_panen_pekarangan: parseDecimalField(
        formData.hasil_panen_pekarangan,
      ),
      nilai_ekonomi: parseDecimalField(formData.nilai_ekonomi),
      jangkauan_kampanye: parseIntegerField(formData.jangkauan_kampanye),
      jumlah_peserta_edukasi: parseIntegerField(
        formData.jumlah_peserta_edukasi,
      ),
      jumlah_anggota_kelompok: parseIntegerField(
        formData.jumlah_anggota_kelompok,
      ),
      frekuensi_pendampingan: parseIntegerField(
        formData.frekuensi_pendampingan,
      ),
      omzet_kelompok: parseDecimalField(formData.omzet_kelompok),
      nilai_bantuan: parseDecimalField(formData.nilai_bantuan),
      biaya_kegiatan: parseDecimalField(formData.biaya_kegiatan),
    };
  }

  if (moduleId === "bks-kmn") {
    return {
      ...formData,
      layanan_id:
        BKS_KMN_LAYANAN_MAP[formData.jenis_kegiatan_keamanan] ||
        formData.layanan_id ||
        "LY117",
      jumlah_pelaku_dibina: parseIntegerField(formData.jumlah_pelaku_dibina),
      jumlah_peserta_sosialisasi: parseIntegerField(
        formData.jumlah_peserta_sosialisasi,
      ),
    };
  }

  if (moduleId === "bks-bmb") {
    return {
      ...formData,
      layanan_id:
        BKS_BMB_LAYANAN_MAP[formData.jenis_kegiatan] ||
        formData.layanan_id ||
        "LY122",
      jumlah_peserta: parseIntegerField(formData.jumlah_peserta),
      jumlah_sasaran_penyuluhan: parseIntegerField(
        formData.jumlah_sasaran_penyuluhan,
      ),
      biaya_kegiatan: parseDecimalField(formData.biaya_kegiatan),
    };
  }

  if (moduleId === "bks-evl") {
    return {
      ...formData,
      layanan_id:
        BKS_EVL_LAYANAN_MAP[formData.jenis_evaluasi] ||
        formData.layanan_id ||
        "LY127",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      persentase_capaian: parseDecimalField(formData.persentase_capaian),
      skor_pph_capaian: parseDecimalField(formData.skor_pph_capaian),
      skor_pph_target: parseDecimalField(formData.skor_pph_target),
      anggaran_program: parseDecimalField(formData.anggaran_program),
      realisasi_anggaran: parseDecimalField(formData.realisasi_anggaran),
      persentase_serapan: parseDecimalField(formData.persentase_serapan),
    };
  }

  if (moduleId === "bks-lap") {
    return {
      ...formData,
      layanan_id:
        BKS_LAP_LAYANAN_MAP[formData.jenis_laporan] ||
        formData.layanan_id ||
        "LY130",
      tahun: parseIntegerField(formData.tahun),
      bulan: parseIntegerField(formData.bulan),
      skor_pph: parseDecimalField(formData.skor_pph),
      target_pph: parseDecimalField(formData.target_pph),
      data_sakip_capaian: parseDecimalField(formData.data_sakip_capaian),
      data_sakip_target: parseDecimalField(formData.data_sakip_target),
      anggaran_program: parseDecimalField(formData.anggaran_program),
      realisasi_anggaran: parseDecimalField(formData.realisasi_anggaran),
      persentase_serapan: parseDecimalField(formData.persentase_serapan),
    };
  }

  return formData;
}

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
