export default (sequelize, DataTypes) => {
  const rekomendasi_intervensi_konsumsi = sequelize.define('rekomendasi_intervensi_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekomendasi_intervensi_konsumsi' });
  

rekomendasi_intervensi_konsumsi.associate = (models) => {
  rekomendasi_intervensi_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekomendasi_intervensi_konsumsi;
};
