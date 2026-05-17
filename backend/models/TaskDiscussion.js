import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskDiscussion =
  sequelize.models.TaskDiscussion ||
  sequelize.define(
    "TaskDiscussion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pengirim_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      penerima_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pesan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "task_discussions",
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  );

export default TaskDiscussion;
