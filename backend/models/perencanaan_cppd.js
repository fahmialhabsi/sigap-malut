export default (sequelize, DataTypes) => {
  const perencanaan_cppd = sequelize.define('perencanaan_cppd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'perencanaan_cppd' });
  

perencanaan_cppd.associate = (models) => {
  perencanaan_cppd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return perencanaan_cppd;
};
