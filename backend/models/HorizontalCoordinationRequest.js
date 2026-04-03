import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const HorizontalCoordinationRequest = sequelize.define(
  "HorizontalCoordinationRequest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    execution_thread_id: { type: DataTypes.STRING(36), allowNull: false },
    coordination_kind: {
      type: DataTypes.STRING(48),
      allowNull: false,
      defaultValue: "sync_request",
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "diajukan",
    },
    subject: { type: DataTypes.TEXT, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: true },
    from_user_id: { type: DataTypes.INTEGER, allowNull: false },
    to_user_id: { type: DataTypes.INTEGER, allowNull: true },
    from_unit: { type: DataTypes.STRING(255), allowNull: true },
    to_unit: { type: DataTypes.STRING(255), allowNull: true },
    from_org_level: {
      type: DataTypes.STRING(32),
      allowNull: true,
      defaultValue: "sekretaris",
    },
    to_org_level: {
      type: DataTypes.STRING(32),
      allowNull: true,
      defaultValue: "kabid",
    },
    sla_due_at: { type: DataTypes.DATE, allowNull: true },
    responded_at: { type: DataTypes.DATE, allowNull: true },
    response_body: { type: DataTypes.TEXT, allowNull: true },
    responded_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
    surat_masuk_id: { type: DataTypes.INTEGER, allowNull: true },
    task_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: "horizontal_coordination_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);

export default HorizontalCoordinationRequest;
