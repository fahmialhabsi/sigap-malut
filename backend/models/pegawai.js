export default (sequelize, DataTypes) => {
  // File: backend/models/pegawai.js

  const Pegawai = sequelize.define(
    "Pegawai",
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
      tableName: "pegawai",
      timestamps: true,
      underscored: true,
    },
  );

  Pegawai.associate = (models) => {
    // associations will be added by generator
    Pegawai.hasMany(models.AuditLog, {
      foreignKey: "pegawai_id",
      as: "auditlogs",
    });
    Pegawai.hasMany(models.PengelolaanDataKepegawaian, {
      foreignKey: "pegawai_id",
      as: "pengelolaanDataKepegawaians",
    });
    Pegawai.hasMany(models.SA06, { foreignKey: "pegawai_id", as: "sa06s" });
  };

  return Pegawai;
};
