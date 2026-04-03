import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ClarificationMessage =
  sequelize.models.ClarificationMessage ||
  sequelize.define(
    "ClarificationMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thread_id: { type: DataTypes.INTEGER, allowNull: false },
      author_id: { type: DataTypes.INTEGER, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      tableName: "clarification_messages",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default ClarificationMessage;
