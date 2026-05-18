import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RpjmdPeriode =
  sequelize.models.RpjmdPeriode ||
  sequelize.define(
    "RpjmdPeriode",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      tahun_awal: { type: DataTypes.INTEGER, allowNull: false },
      tahun_akhir: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "rpjmd_periode",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default RpjmdPeriode;
