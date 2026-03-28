import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Task from "./Task.js";
import User from "./User.js";

const SubChecklistTugas = sequelize.define(
  "SubChecklistTugas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "id",
      },
    },
    dibuat_oleh: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    deskripsi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_selesai: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    selesai_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    urutan: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    tableName: "sub_checklist_tugas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: false,
        fields: ["task_id", "urutan"],
      },
    ],
  },
);

// Associations
SubChecklistTugas.belongsTo(Task, { foreignKey: "task_id" });
SubChecklistTugas.belongsTo(User, { foreignKey: "dibuat_oleh", as: "pembuat" });

Task.hasMany(SubChecklistTugas, { foreignKey: "task_id", as: "subChecklist" });
User.hasMany(SubChecklistTugas, { foreignKey: "dibuat_oleh" });

export default SubChecklistTugas;
