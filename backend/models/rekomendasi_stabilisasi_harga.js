export default (sequelize, DataTypes) => {
  const rekomendasi_stabilisasi_harga = sequelize.define('rekomendasi_stabilisasi_harga', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekomendasi_stabilisasi_harga' });
  

rekomendasi_stabilisasi_harga.associate = (models) => {
  rekomendasi_stabilisasi_harga.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekomendasi_stabilisasi_harga;
};
