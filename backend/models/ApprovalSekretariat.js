// backend/models/ApprovalSekretariat.js
// Model multi-level approval sekretariat: Pelaksana→Kasubag→JF→Sekretaris

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ApprovalSekretariat = sequelize.define(
  "ApprovalSekretariat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomor_dokumen: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    jenis: {
      type: DataTypes.ENUM(
        "kepegawaian_kgb", "kepegawaian_pangkat", "kepegawaian_cuti",
        "keuangan_spj", "keuangan_gu_tup", "keuangan_laporan",
        "analisa_jf_perencanaan", "analisa_jf_keuangan",
        "aset_bmd", "surat_resmi", "laporan_konsolidasi",
        "laporan_dari_bidang", "tindak_lanjut_kadin"
      ),
      allowNull: false,
    },
    asal_unit: {
      type: DataTypes.ENUM(
        "kasubag_umum_kepeg", "jf_perencanaan", "jf_keuangan",
        "jf_lainnya", "bendahara_pengeluaran", "bendahara_gaji",
        "bendahara_barang", "pelaksana_sekretariat",
        "bidang_ketersediaan", "bidang_distribusi",
        "bidang_konsumsi", "uptd"
      ),
      allowNull: false,
    },
    submitted_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lampiran_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Level 1: Kasubag verifikasi
    diverifikasi_kasubag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifikasi_kasubag_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verifikasi_oleh_kasubag: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan_kasubag: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Level 2: JF analisa
    perlu_analisa_jf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dianalisa_jf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    analisa_jf_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    analisa_oleh_jf: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    catatan_jf: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Level 3: Sekretaris approve
    status: {
      type: DataTypes.ENUM(
        "draft",
        "menunggu_verifikasi_kasubag",
        "dikembalikan_kasubag",
        "menunggu_analisa_jf",
        "dikembalikan_jf",
        "menunggu_persetujuan_sekretaris",
        "disetujui",
        "ditolak",
        "dikembalikan_sekretaris",
        "diteruskan_ke_kadin"
      ),
      defaultValue: "draft",
    },
    catatan_sekretaris: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diputuskan_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    diputuskan_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Tracking revisi
    revisi_ke: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    revisi_dari: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "approval_sekretariat",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

export default ApprovalSekretariat;
