// backend/models/EquipmentMaintenance.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EquipmentMaintenance =
  sequelize.models.EquipmentMaintenance ||
  sequelize.define(
    "EquipmentMaintenance",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nama_alat: { type: DataTypes.STRING(200), allowNull: false },
      kode_alat: { type: DataTypes.STRING(50), allowNull: true },
      tanggal_terakhir: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_berikutnya: { type: DataTypes.DATEONLY, allowNull: true },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "terjadwal",
      },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      penanggung_jawab: { type: DataTypes.STRING(100), allowNull: true },
      created_by_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "EquipmentMaintenance",
      timestamps: false,
      underscored: true,
    },
  );

export default EquipmentMaintenance;
