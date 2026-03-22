import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskFile =
  sequelize.models.TaskFile ||
  sequelize.define(
    "TaskFile",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      task_id: { type: DataTypes.INTEGER, allowNull: false },
      file_name: { type: DataTypes.STRING, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_type: { type: DataTypes.STRING, allowNull: true },
      file_size: { type: DataTypes.INTEGER, allowNull: true },
      uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
      file_hash: { type: DataTypes.STRING(64), allowNull: true },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "TaskFiles",
      timestamps: false,
      underscored: true,
    },
  );

export default TaskFile;
