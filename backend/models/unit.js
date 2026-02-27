export default (sequelize, DataTypes) => {
  // File: backend/models/unit.js

  const Unit = sequelize.define(
    "Unit",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "units",
      timestamps: true,
      underscored: true,
    },
  );

  Unit.associate = (models) => {
    // associations will be added by generator
    Unit.hasMany(models.User, { foreignKey: "unit_id", as: "users" });
  };

  return Unit;
};
