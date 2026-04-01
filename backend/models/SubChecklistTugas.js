import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SubChecklistTugas =
  sequelize.models.SubChecklistTugas ||
  sequelize.define(
    "SubChecklistTugas",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      task_id: { type: DataTypes.INTEGER, allowNull: false },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      deskripsi: { type: DataTypes.STRING(255), allowNull: false },
      is_selesai: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      selesai_at: { type: DataTypes.DATE, allowNull: true },
      urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "sub_checklist_tugas",
      timestamps: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default SubChecklistTugas;

