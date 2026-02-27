export default (sequelize, DataTypes) => {
  const pembinaan_pasca_temuan = sequelize.define('pembinaan_pasca_temuan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pembinaan_pasca_temuan' });
  

pembinaan_pasca_temuan.associate = (models) => {
  pembinaan_pasca_temuan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pembinaan_pasca_temuan;
};
