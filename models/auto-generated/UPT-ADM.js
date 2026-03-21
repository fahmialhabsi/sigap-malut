import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const UPT-ADM = sequelize.define(
  'UPT-ADM', {
    unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
    akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
  }, { tableName: 'UPT-ADM', timestamps: false });

export default UPT-ADM;
