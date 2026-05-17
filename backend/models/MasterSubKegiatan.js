import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MasterSubKegiatan =
  sequelize.models.MasterSubKegiatan ||
  sequelize.define(
    "MasterSubKegiatan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      regulasi_versi_id: { type: DataTypes.INTEGER, allowNull: false },
      master_kegiatan_id: { type: DataTypes.INTEGER, allowNull: false },
      kode: { type: DataTypes.STRING(64), allowNull: false },
      nama: { type: DataTypes.STRING(512), allowNull: false },
    },
    {
      tableName: "master_sub_kegiatan",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default MasterSubKegiatan;
