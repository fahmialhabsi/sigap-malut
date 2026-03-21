import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const UPT-AST = sequelize.define(
  'UPT-AST', {
    unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
    lokasi_unit: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "UPTD Balai Pengawasan Mutu" },
    kategori_aset_uptd: { type: DataTypes.ENUM, allowNull: true },
    akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
  }, { tableName: 'UPT-AST', timestamps: false });

export default UPT-AST;
