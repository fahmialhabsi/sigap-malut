import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskLog =
  sequelize.models.TaskLog ||
  sequelize.define(
    "TaskLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      data_old: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      data_new: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "TaskLogs",
      timestamps: false,
      underscored: true,
    },
  );

export default TaskLog;
