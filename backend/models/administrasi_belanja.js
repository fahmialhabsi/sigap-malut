export default (sequelize, DataTypes) => {
  const administrasi_belanja = sequelize.define(
    "administrasi_belanja",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      layanan_id: { type: DataTypes.UUID },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB },
    },
    { tableName: "administrasi_belanja" },
  );

  administrasi_belanja.associate = (models) => {
    administrasi_belanja.belongsTo(models.Layanan, {
      foreignKey: "layanan_id",
      as: "layanan",
    });
  };
  return administrasi_belanja;
};
