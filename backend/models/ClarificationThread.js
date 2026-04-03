import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ClarificationThread =
  sequelize.models.ClarificationThread ||
  sequelize.define(
    "ClarificationThread",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      anchor_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      anchor_id: { type: DataTypes.INTEGER, allowNull: false },
      lane: { type: DataTypes.STRING(32), allowNull: false },
      subject: { type: DataTypes.STRING(255), allowNull: true },
    participant_user_ids: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    execution_thread_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
    },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "clarification_threads",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default ClarificationThread;
