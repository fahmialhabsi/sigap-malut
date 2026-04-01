import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const HasilUjiFisik = sequelize.define("HasilUjiFisik", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uji_lab_id: { type: DataTypes.INTEGER, allowNull: false },
  parameter: { type: DataTypes.STRING(100), allowNull: false },
  nilai_terukur: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
  satuan: { type: DataTypes.STRING(30), allowNull: true },
  batas_snk: { type: DataTypes.STRING(100), allowNull: true },
  status_hasil: { type: DataTypes.STRING(30), defaultValue: "perlu_verifikasi" },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  diuji_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "hasil_uji_fisik",
  timestamps: false,
});

export default HasilUjiFisik;
