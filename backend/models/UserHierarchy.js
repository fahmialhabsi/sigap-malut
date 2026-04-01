import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserHierarchy =
  sequelize.models.UserHierarchy ||
  sequelize.define(
    "UserHierarchy",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      atasan_id: { type: DataTypes.INTEGER, allowNull: false },
      bawahan_id: { type: DataTypes.INTEGER, allowNull: false },
      adalah_primer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "user_hierarchy",
      timestamps: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default UserHierarchy;

