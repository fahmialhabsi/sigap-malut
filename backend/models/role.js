export default (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: "roles",
      timestamps: true,
    },
  );

  Role.associate = (models) => {
    Role.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
    Role.hasMany(models.RolePermission, {
      foreignKey: "role_id",
      as: "rolepermissions",
    });
    Role.hasMany(models.User, { foreignKey: "role_id", as: "users" });
  };

  return Role;
};
