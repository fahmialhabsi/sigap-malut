export default (sequelize, DataTypes) => {
  const rekomendasi_teknis_keamanan_pangan = sequelize.define('rekomendasi_teknis_keamanan_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekomendasi_teknis_keamanan_pangan' });
  

rekomendasi_teknis_keamanan_pangan.associate = (models) => {
  rekomendasi_teknis_keamanan_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekomendasi_teknis_keamanan_pangan;
};
