import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const HasilUjiMikrobiologi = sequelize.define("HasilUjiMikrobiologi", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uji_lab_id: { type: DataTypes.INTEGER, allowNull: false },
  parameter: { type: DataTypes.STRING(100), allowNull: false },
  nilai_terukur: { type: DataTypes.DECIMAL(15, 4), allowNull: true },
  satuan: { type: DataTypes.STRING(30), allowNull: true },
  batas_max_snk: { type: DataTypes.DECIMAL(15, 4), allowNull: true },
  status_hasil: { type: DataTypes.STRING(30), defaultValue: "perlu_verifikasi" },
  metode_uji: { type: DataTypes.STRING(100), allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  diuji_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "hasil_uji_mikrobiologi",
  timestamps: false,
});

export default HasilUjiMikrobiologi;
