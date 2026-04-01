import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AnalisaKeuangan =
  sequelize.models.AnalisaKeuangan ||
  sequelize.define(
    "AnalisaKeuangan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_analisa: { type: DataTypes.STRING(50), allowNull: true, unique: true },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      jenis_analisa: { type: DataTypes.STRING(64), allowNull: false },
      spj_id: { type: DataTypes.INTEGER, allowNull: true },
      bendahara_pengirim_id: { type: DataTypes.INTEGER, allowNull: true },
      jenis_bendahara: { type: DataTypes.STRING(16), allowNull: true }, // pengeluaran|gaji|barang
      dokumen_input_url: { type: DataTypes.STRING(500), allowNull: true },
      dokumen_hasil_url: { type: DataTypes.STRING(500), allowNull: true },
      checklist_ppk: { type: DataTypes.JSON, allowNull: true },
      temuan_ppk: { type: DataTypes.TEXT, allowNull: true },
      dasar_hukum: { type: DataTypes.TEXT, allowNull: true },
      rekomendasi: { type: DataTypes.TEXT, allowNull: true },
      tujuan_submit: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "sekretaris" },
      status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "draft" },
      keputusan_kasubag: { type: DataTypes.STRING(32), allowNull: true },
      catatan_kasubag: { type: DataTypes.TEXT, allowNull: true },
      diputuskan_kasubag_at: { type: DataTypes.DATE, allowNull: true },
      diputuskan_kasubag_oleh: { type: DataTypes.INTEGER, allowNull: true },
      keputusan_sekretaris: { type: DataTypes.STRING(32), allowNull: true },
      catatan_sekretaris: { type: DataTypes.TEXT, allowNull: true },
      diputuskan_sekretaris_at: { type: DataTypes.DATE, allowNull: true },
      diputuskan_sekretaris_oleh: { type: DataTypes.INTEGER, allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      revisi_dari: { type: DataTypes.INTEGER, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      task_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "analisa_keuangan",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default AnalisaKeuangan;

