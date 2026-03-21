import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DataIntegrationLog = sequelize.define(
  "data_integration_log",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    source_unit: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    source_table: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    source_record_id: {
      type: DataTypes.STRING(100),
    },
    destination_table: {
      type: DataTypes.STRING(100),
    },
    integration_type: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.STRING(20),
    },
    integrated_by: {
      type: DataTypes.STRING(100),
    },
    integrated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    data_snapshot: {
      type: DataTypes.JSONB,
    },
    error_message: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "data_integration_log",
    timestamps: false,
  },
);

export default DataIntegrationLog;
