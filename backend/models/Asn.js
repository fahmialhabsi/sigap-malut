export default (sequelize, DataTypes) => {
  // File: backend/models/Asn.js

  const Asn = sequelize.define(
    "Asn",
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
      tableName: "asns",
      timestamps: true,
      underscored: true,
    },
  );

  Asn.associate = (models) => {
    // associations will be added by generator
    Asn.hasMany(models.DataIndukAsn, {
      foreignKey: "asn_id",
      as: "dataIndukAsns",
    });
    Asn.hasMany(models.SekKep, { foreignKey: "asn_id", as: "sekkeps" });
  };

  return Asn;
};
