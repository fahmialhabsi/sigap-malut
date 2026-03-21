import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const UPT-KEP = sequelize.define(
  'UPT-KEP', {
    unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
    akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
    hak_akses_uptd: { type: DataTypes.ENUM, allowNull: false, defaultValue: "read_write" },
  }, { tableName: 'UPT-KEP', timestamps: false });

export default UPT-KEP;
