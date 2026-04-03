import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NotificationOutbox = sequelize.define(
  "NotificationOutbox",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_key: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    channel: { type: DataTypes.STRING(32), allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    next_retry_at: { type: DataTypes.DATE, allowNull: true },
    last_error: { type: DataTypes.TEXT, allowNull: true },
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
    tableName: "notification_outbox",
    timestamps: false,
    underscored: true,
  },
);

export default NotificationOutbox;
