export default (sequelize, DataTypes) => {
  // File: backend/models/entitas.js

  const Entitas = sequelize.define(
    "Entitas",
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
      tableName: "entitas",
      timestamps: true,
      underscored: true,
    },
  );

  Entitas.associate = (models) => {
    if (models.Tipe && models.Tipe.rawAttributes) {
      Entitas.belongsTo(models.Tipe, { foreignKey: "Field", as: "field" });
    }
    if (models.SA06 && models.SA06.rawAttributes) {
      Entitas.hasMany(models.SA06, { foreignKey: "entitas_id", as: "sa06s" });
    }
  };

  return Entitas;
};
