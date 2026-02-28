export default (sequelize, DataTypes) => {
  const kebijakan_penyusunan_rekomendasi = sequelize.define('kebijakan_penyusunan_rekomendasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_penyusunan_rekomendasi' });
  

kebijakan_penyusunan_rekomendasi.associate = (models) => {
  kebijakan_penyusunan_rekomendasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_penyusunan_rekomendasi;
};
