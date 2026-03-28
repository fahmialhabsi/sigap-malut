import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskAssignment =
  sequelize.models.TaskAssignment ||
  sequelize.define(
    "TaskAssignment",
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
      assignee_role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      assignee_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "assigned",
      },
    },
    {
      tableName: "TaskAssignments",
      timestamps: false,
      underscored: true,
    },
  );

export default TaskAssignment;
