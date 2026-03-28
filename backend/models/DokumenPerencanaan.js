// backend/models/DokumenPerencanaan.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DokumenPerencanaan = sequelize.define("DokumenPerencanaan", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  jenis_dokumen: {
    type: DataTypes.STRING(30), allowNull: false,
    validate: { isIn: [["renstra", "renja", "rka", "dpa", "lap_bulanan", "lap_triwulan", "lkpj", "lakip"]] },
  },
  judul: { type: DataTypes.STRING(255), allowNull: false },
  periode: { type: DataTypes.STRING(20), allowNull: true },
  status: {
    type: DataTypes.STRING(20), defaultValue: "draft",
    validate: { isIn: [["draft", "in_review", "disetujui", "dikembalikan", "published"]] },
  },
  dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
  disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
  file_url: { type: DataTypes.STRING(500), allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: "dokumen_perencanaan",
  underscored: true,
  paranoid: true,
  timestamps: true,
});

export default DokumenPerencanaan;
