import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Monev =
  sequelize.models.Monev ||
  sequelize.define(
    "Monev",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      renja_id: { type: DataTypes.INTEGER, allowNull: false },
      subkegiatan_id: { type: DataTypes.STRING(100), allowNull: false },
      nama_subkegiatan: { type: DataTypes.STRING(255), allowNull: false },
      target_q1: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      target_q2: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      target_q3: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      target_q4: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      realisasi_q1: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      realisasi_q2: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      realisasi_q3: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      realisasi_q4: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      pagu_anggaran: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      realisasi_anggaran: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      catatan_deviasi: { type: DataTypes.TEXT, allowNull: true },
      faktor_hambatan: { type: DataTypes.TEXT, allowNull: true },
      input_oleh: { type: DataTypes.INTEGER, allowNull: true },
      input_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "monev",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Monev;

