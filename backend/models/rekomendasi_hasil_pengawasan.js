export default (sequelize, DataTypes) => {
  const rekomendasi_hasil_pengawasan = sequelize.define('rekomendasi_hasil_pengawasan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekomendasi_hasil_pengawasan' });
  

rekomendasi_hasil_pengawasan.associate = (models) => {
  rekomendasi_hasil_pengawasan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekomendasi_hasil_pengawasan;
};
