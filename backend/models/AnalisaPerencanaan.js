import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AnalisaPerencanaan =
  sequelize.models.AnalisaPerencanaan ||
  sequelize.define(
    "AnalisaPerencanaan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_analisa: { type: DataTypes.STRING(50), allowNull: true, unique: true },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      jenis_analisa: { type: DataTypes.STRING(64), allowNull: false },
      dokumen_input_url: { type: DataTypes.STRING(500), allowNull: true },
      sumber_data_epelara: { type: DataTypes.STRING(500), allowNull: true },
      periode_tahun: { type: DataTypes.INTEGER, allowNull: true },
      periode_triwulan: { type: DataTypes.INTEGER, allowNull: true },
      catatan_teknis: { type: DataTypes.TEXT, allowNull: true },
      rekomendasi: { type: DataTypes.TEXT, allowNull: true },
      temuan_cascading: { type: DataTypes.JSON, allowNull: true },
      skor_kesesuaian_rpjmd: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      dokumen_hasil_url: { type: DataTypes.STRING(500), allowNull: true },
      tujuan_submit: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "sekretaris" },
      status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "draft" },
      task_id: { type: DataTypes.INTEGER, allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      revisi_dari: { type: DataTypes.INTEGER, allowNull: true },
      keputusan_kasubag: { type: DataTypes.STRING(32), allowNull: true },
      catatan_kasubag: { type: DataTypes.TEXT, allowNull: true },
      diputuskan_kasubag_at: { type: DataTypes.DATE, allowNull: true },
      diputuskan_kasubag_oleh: { type: DataTypes.INTEGER, allowNull: true },
      keputusan_sekretaris: { type: DataTypes.STRING(32), allowNull: true },
      catatan_sekretaris: { type: DataTypes.TEXT, allowNull: true },
      diputuskan_sekretaris_at: { type: DataTypes.DATE, allowNull: true },
      diputuskan_sekretaris_oleh: { type: DataTypes.INTEGER, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "analisa_perencanaan",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default AnalisaPerencanaan;

