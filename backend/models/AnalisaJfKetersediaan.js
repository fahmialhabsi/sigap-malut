// backend/models/AnalisaJfKetersediaan.js
// Dokumen analisa/laporan yang disusun JF Bidang Ketersediaan

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AnalisaJfKetersediaan = sequelize.define(
  "AnalisaJfKetersediaan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jf_id: { type: DataTypes.INTEGER, allowNull: false, comment: "FK users — JF penyusun" },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    jenis: {
      type: DataTypes.ENUM(
        "analisa_ketersediaan", "analisa_kerawanan",
        "neraca_pangan", "laporan_bimtek", "rekomendasi"
      ),
      allowNull: false,
    },
    isi_analisa: { type: DataTypes.TEXT, allowNull: false },
    periode: { type: DataTypes.STRING(20), allowNull: true },
    // JSON array of IDs referencing produksi_pangan, stok_pangan, etc.
    referensi_data: { type: DataTypes.JSONB, allowNull: true },
    dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "diajukan_kabid", "dikembalikan", "disetujui"),
      defaultValue: "draft",
    },
    catatan_kabid: { type: DataTypes.TEXT, allowNull: true },
    diajukan_at: { type: DataTypes.DATE, allowNull: true },
    disetujui_at: { type: DataTypes.DATE, allowNull: true },
    // Setelah disetujui Kabid, diteruskan ke Sekretaris
    diteruskan_sekretaris_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "analisa_jf_ketersediaan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default AnalisaJfKetersediaan;
