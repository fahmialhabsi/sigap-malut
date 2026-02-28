export default (sequelize, DataTypes) => {
  const rekomendasi_perbaikan_mutu = sequelize.define('rekomendasi_perbaikan_mutu', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekomendasi_perbaikan_mutu' });
  

rekomendasi_perbaikan_mutu.associate = (models) => {
  rekomendasi_perbaikan_mutu.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekomendasi_perbaikan_mutu;
};
