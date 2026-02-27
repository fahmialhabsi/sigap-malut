export default (sequelize, DataTypes) => {
  const bimtek_konsumsi_pangan = sequelize.define('bimtek_konsumsi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimtek_konsumsi_pangan' });
  

bimtek_konsumsi_pangan.associate = (models) => {
  bimtek_konsumsi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimtek_konsumsi_pangan;
};
