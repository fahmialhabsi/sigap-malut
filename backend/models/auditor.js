export default (sequelize, DataTypes) => {
  // File: backend/models/auditor.js

  const Auditor = sequelize.define(
    "Auditor",
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
      tableName: "auditors",
      timestamps: true,
      underscored: true,
    },
  );

  Auditor.associate = (models) => {
    // associations will be added by generator
    Auditor.hasMany(models.DatabaseKompetensiAuditor, {
      foreignKey: "auditor_id",
      as: "databaseKompetensiAuditors",
    });
    Auditor.hasMany(models.UptMtu, { foreignKey: "auditor_id", as: "uptmtus" });
  };

  return Auditor;
};
