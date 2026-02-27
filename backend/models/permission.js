export default (sequelize, DataTypes) => {
  // import { DataTypes } from "sequelize";
  // import sequelize from "../config/database.js";

  const Permission = sequelize.define(
    "Permission",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      key: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "permissions",
      timestamps: true,
    },
  );

  Permission.associate = (models) => {
    Permission.belongsTo(models.Permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
    Permission.hasMany(models.RolePermission, {
      foreignKey: "permission_id",
      as: "rolepermissions",
    });
  };

  return Permission;
};
