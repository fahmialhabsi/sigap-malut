import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const UserHierarchy =
  sequelize.models.UserHierarchy ||
  sequelize.define(
    "UserHierarchy",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      has_subordinate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      unit_kerja: {
        type: DataTypes.STRING(100),
        allowNull: true,
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
      tableName: "user_hierarchy",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

if (!UserHierarchy.associations?.user) {
  UserHierarchy.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (!UserHierarchy.associations?.supervisor) {
  UserHierarchy.belongsTo(User, {
    foreignKey: "supervisor_id",
    as: "supervisor",
  });
}

if (!User.associations?.hierarchyRecord) {
  User.hasOne(UserHierarchy, { foreignKey: "user_id", as: "hierarchyRecord" });
}

export default UserHierarchy;
