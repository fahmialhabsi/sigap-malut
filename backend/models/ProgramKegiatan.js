// backend/models/ProgramKegiatan.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProgramKegiatan = sequelize.define("ProgramKegiatan", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  kode_kegiatan: { type: DataTypes.STRING(30), unique: true, allowNull: true },
  nama_kegiatan: { type: DataTypes.STRING(255), allowNull: false },
  bidang: { type: DataTypes.STRING(50), allowNull: false },
  tahun_anggaran: { type: DataTypes.INTEGER, allowNull: false, defaultValue: () => new Date().getFullYear() },
  anggaran_pagu: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  anggaran_realisasi: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  target_fisik: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  realisasi_fisik: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.STRING(20), defaultValue: "aktif" },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "program_kegiatan",
  underscored: true,
  paranoid: true,
  timestamps: true,
});

export default ProgramKegiatan;
