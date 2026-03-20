import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const UPT-KEU = sequelize.define(
  'UPT-KEU', {
    unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
    kode_unit: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "01" },
    akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
  }, { tableName: 'UPT-KEU', timestamps: false });

export default UPT-KEU;
