export default (sequelize, DataTypes) => {
  const penerimaan_tamu = sequelize.define('penerimaan_tamu', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penerimaan_tamu' });
  

penerimaan_tamu.associate = (models) => {
  penerimaan_tamu.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penerimaan_tamu;
};
