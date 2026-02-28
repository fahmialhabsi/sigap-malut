export default (sequelize, DataTypes) => {
  const kebijakan_analisis_ketersediaan_pangan = sequelize.define('kebijakan_analisis_ketersediaan_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_analisis_ketersediaan_pangan' });
  

kebijakan_analisis_ketersediaan_pangan.associate = (models) => {
  kebijakan_analisis_ketersediaan_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_analisis_ketersediaan_pangan;
};
