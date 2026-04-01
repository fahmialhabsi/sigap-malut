import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Prompt 2 (Kepala Dinas): pengajuan dari bawahan (gateway sekretaris)
const PengajuanKeKepalaDinas = sequelize.define(
  "PengajuanKeKepalaDinas",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_pengajuan: { type: DataTypes.STRING(50), unique: true },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    jenis: {
      type: DataTypes.ENUM(
        "persetujuan_program",
        "persetujuan_anggaran",
        "laporan_pelaksanaan",
        "rekomendasi_kebijakan",
        "tindak_lanjut_instruksi_gub",
        "informasi",
      ),
      allowNull: false,
    },
    isi_pengajuan: { type: DataTypes.TEXT, allowNull: false },
    lampiran_url: { type: DataTypes.STRING(500) },

    submitted_by: { type: DataTypes.INTEGER, allowNull: false },

    // gateway sekretaris
    divalidasi_sekretaris: { type: DataTypes.BOOLEAN, defaultValue: false },
    divalidasi_at: { type: DataTypes.DATE },
    divalidasi_oleh: { type: DataTypes.INTEGER },
    catatan_sekretaris: { type: DataTypes.TEXT },

    instruksi_gubernur_id: { type: DataTypes.INTEGER },
    task_id: { type: DataTypes.INTEGER },

    status: {
      type: DataTypes.ENUM(
        "draft",
        "diajukan_ke_sekretaris",
        "dalam_review_sekretaris",
        "diteruskan_ke_kadin",
        "dalam_review_kadin",
        "disetujui",
        "ditolak",
        "dikembalikan",
      ),
      defaultValue: "draft",
    },
    catatan_kadin: { type: DataTypes.TEXT },
    diputuskan_at: { type: DataTypes.DATE },
    diputuskan_oleh: { type: DataTypes.INTEGER },

    revisi_ke: { type: DataTypes.INTEGER, defaultValue: 0 },
    revisi_dari: { type: DataTypes.INTEGER },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "pengajuan_ke_kepala_dinas",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PengajuanKeKepalaDinas;

