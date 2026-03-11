import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskLog = sequelize.define(
  "TaskLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    from_status: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    to_status: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    notes: {
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
  },
  {
    tableName: "task_logs",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default TaskLog;
