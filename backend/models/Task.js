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
      sumber_perintah_kadin: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Task',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "assigned",
          "accepted",
          "in_progress",
          "submitted",
          "verified",
          // Bidang workflow statuses (v2.7)
          "review_kabid",
          "submitted_to_kabid",
          "approved_kabid",
          "returned_to_jf",
          "submitted_to_jf",
          "verified_by_jf",
          "returned_to_pelaksana",
          // Sekretariat approval chain
          "approved_by_secretary",
          "forwarded_to_kadin",
          // Strategic governance layer — Gubernur (v2.8)
          // Tasks needing Gubernur decision are escalated from forwarded_to_kadin.
          "escalated_to_governor",
          "approved_by_governor",
          "rejected_by_governor",
          // Terminal states
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
      execution_thread_id: {
        type: DataTypes.STRING(36),
        allowNull: true,
      },
      // Return workflow (Kasubag/JF mengembalikan ke Pelaksana)
      returned_by: { type: DataTypes.INTEGER, allowNull: true },
      returned_at: { type: DataTypes.DATE, allowNull: true },
      catatan_verifikasi: { type: DataTypes.TEXT, allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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

