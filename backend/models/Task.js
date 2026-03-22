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
      module: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      source_unit: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "assigned",
          "accepted",
          "in_progress",
          "submitted",
          "verified",
          "approved_by_secretary",
          "forwarded_to_kadin",
          "closed",
          "rejected",
          "escalated",
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3, // 1=urgent, 2=high, 3=normal, 4=low
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sla_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
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
