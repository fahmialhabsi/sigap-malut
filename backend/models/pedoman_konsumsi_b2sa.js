export default (sequelize, DataTypes) => {
  const pedoman_konsumsi_b2sa = sequelize.define('pedoman_konsumsi_b2sa', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pedoman_konsumsi_b2sa' });
  

pedoman_konsumsi_b2sa.associate = (models) => {
  pedoman_konsumsi_b2sa.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pedoman_konsumsi_b2sa;
};
