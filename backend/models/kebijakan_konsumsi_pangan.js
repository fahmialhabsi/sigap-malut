export default (sequelize, DataTypes) => {
  const kebijakan_konsumsi_pangan = sequelize.define('kebijakan_konsumsi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_konsumsi_pangan' });
  

kebijakan_konsumsi_pangan.associate = (models) => {
  kebijakan_konsumsi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_konsumsi_pangan;
};
