import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ApprovalSekretariat = sequelize.define(
  "ApprovalSekretariat",
  {
    nomor_dokumen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    jenis: {
      type: DataTypes.ENUM(
        "kepegawaian_kgb",
        "kepegawaian_pangkat",
        "kepegawaian_cuti",
        "keuangan_spj",
        "keuangan_gu_tup",
        "keuangan_laporan",
        "analisa_jf_perencanaan",
        "analisa_jf_keuangan",
        "aset_bmd",
        "surat_resmi",
        "laporan_konsolidasi",
        "laporan_dari_bidang",
        "tindak_lanjut_kadin",
      ),
      allowNull: false,
    },

    asal_unit: {
      type: DataTypes.ENUM(
        "kasubag_umum_kepeg",
        "jf_perencanaan",
        "jf_keuangan",
        "jf_lainnya",
        "bendahara_pengeluaran",
        "bendahara_gaji",
        "bendahara_barang",
        "pelaksana_sekretariat",
        "bidang_ketersediaan",
        "bidang_distribusi",
        "bidang_konsumsi",
        "uptd",
      ),
      allowNull: false,
    },

    submitted_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    lampiran_url: {
      type: DataTypes.STRING(500),
    },

    // ======================
    // KASUBAG
    // ======================
    diverifikasi_kasubag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    verifikasi_kasubag_at: {
      type: DataTypes.DATE,
    },

    verifikasi_oleh_kasubag: {
      type: DataTypes.INTEGER,
    },

    catatan_kasubag: {
      type: DataTypes.TEXT,
    },

    // ======================
    // JF
    // ======================
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
    },

    analisa_oleh_jf: {
      type: DataTypes.INTEGER,
    },

    catatan_jf: {
      type: DataTypes.TEXT,
    },

    // ======================
    // STATUS
    // ======================
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
        "diteruskan_ke_kadin",
      ),
      defaultValue: "draft",
    },

    // ======================
    // SEKRETARIS
    // ======================
    catatan_sekretaris: {
      type: DataTypes.TEXT,
    },

    diputuskan_at: {
      type: DataTypes.DATE,
    },

    diputuskan_oleh: {
      type: DataTypes.INTEGER,
    },

    // ======================
    // REVISI
    // ======================
    revisi_ke: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    revisi_dari: {
      type: DataTypes.INTEGER,
    },

    // ======================
    // RELASI TASK
    // ======================
    task_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "approval_sekretariat",
    timestamps: true,
    underscored: true, // penting biar snake_case konsisten
  },
);

// ======================
// ASSOCIATIONS
// ======================
ApprovalSekretariat.associate = (models) => {
  ApprovalSekretariat.belongsTo(models.User, {
    as: "submittedBy",
    foreignKey: "submitted_by",
  });

  ApprovalSekretariat.belongsTo(models.User, {
    as: "verifikasiOlehKasubag",
    foreignKey: "verifikasi_oleh_kasubag",
  });

  ApprovalSekretariat.belongsTo(models.User, {
    as: "analisaOlehJf",
    foreignKey: "analisa_oleh_jf",
  });

  ApprovalSekretariat.belongsTo(models.User, {
    as: "diputuskanOleh",
    foreignKey: "diputuskan_oleh",
  });

  ApprovalSekretariat.belongsTo(models.Task, {
    foreignKey: "task_id",
  });
};

export default ApprovalSekretariat;
