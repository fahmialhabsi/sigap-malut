import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KgbTracking =
  sequelize.models.KgbTracking ||
  sequelize.define(
    "KgbTracking",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      asn_id: { type: DataTypes.INTEGER, allowNull: false },
      unit_kerja: { type: DataTypes.STRING(100), allowNull: false },
      golongan_saat_ini: { type: DataTypes.STRING(10), allowNull: false },
      tanggal_kgb_terakhir: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_kgb_berikutnya: { type: DataTypes.DATEONLY, allowNull: false },
      besaran_gaji_pokok: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      status_proses: {
        type: DataTypes.ENUM(
          "belum_dimulai",
          "berkas_disiapkan",
          "diajukan_ke_bkd",
          "sk_terbit",
          "selesai",
        ),
        allowNull: false,
        defaultValue: "belum_dimulai",
      },
      tanggal_mulai_proses: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_diajukan_bkd: { type: DataTypes.DATEONLY, allowNull: true },
      nomor_sk: { type: DataTypes.STRING(100), allowNull: true },
      tanggal_sk: { type: DataTypes.DATEONLY, allowNull: true },
      berkas_url: { type: DataTypes.STRING(500), allowNull: true },
      sk_url: { type: DataTypes.STRING(500), allowNull: true },
      notifikasi_h30_terkirim: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notifikasi_h7_terkirim: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notifikasi_h0_terkirim: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notifikasi_terkirim_ke: { type: DataTypes.INTEGER, allowNull: true },
      notifikasi_terkirim_at: { type: DataTypes.DATE, allowNull: true },
      diproses_oleh: { type: DataTypes.INTEGER, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "kgb_tracking",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default KgbTracking;

