import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ExecutionThreadEvent = sequelize.define(
  "ExecutionThreadEvent",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    execution_thread_id: { type: DataTypes.STRING(36), allowNull: false },
    event_type: { type: DataTypes.STRING(64), allowNull: false },
    ref_modul: { type: DataTypes.STRING(100), allowNull: true },
    ref_id: { type: DataTypes.STRING(100), allowNull: true },
    payload: { type: DataTypes.JSON, allowNull: true },
    actor_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: "execution_thread_events",
    timestamps: false,
    underscored: true,
  },
);

export default ExecutionThreadEvent;
