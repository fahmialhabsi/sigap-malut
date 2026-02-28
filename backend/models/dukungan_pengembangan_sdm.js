export default (sequelize, DataTypes) => {
  const dukungan_pengembangan_sdm = sequelize.define('dukungan_pengembangan_sdm', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'dukungan_pengembangan_sdm' });
  

dukungan_pengembangan_sdm.associate = (models) => {
  dukungan_pengembangan_sdm.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return dukungan_pengembangan_sdm;
};
