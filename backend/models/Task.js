import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Task =
  sequelize.models.Task ||
  sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      modul_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      layanan_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "assigned",
          "in_progress",
          "submitted",
          "verified",
          "closed",
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_sensitive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Tasks",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Task;
