import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Diklat =
  sequelize.models.Diklat ||
  sequelize.define(
    "Diklat",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nama_diklat: { type: DataTypes.STRING(255), allowNull: false },
      jenis: {
        type: DataTypes.ENUM("struktural", "teknis", "fungsional", "pim"),
        allowNull: false,
      },
      penyelenggara: { type: DataTypes.STRING(255), allowNull: true },
      tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: false },
      lokasi: { type: DataTypes.STRING(255), allowNull: true },
      kuota: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "diklat",
      timestamps: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default Diklat;

