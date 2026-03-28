import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notification =
  sequelize.models.Notification ||
  sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      target_user_id: { type: DataTypes.INTEGER, allowNull: false },
      task_id: { type: DataTypes.INTEGER, allowNull: true },
      channel: {
        type: DataTypes.ENUM("in_app", "email", "wa"),
        allowNull: false,
        defaultValue: "in_app",
      },
      message: { type: DataTypes.TEXT, allowNull: false },
      link: { type: DataTypes.STRING(500), allowNull: true },
      seen: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Notifications",
      timestamps: false,
      underscored: true,
    },
  );

export default Notification;
