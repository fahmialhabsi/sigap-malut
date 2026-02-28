export default (sequelize, DataTypes) => {
  const penjaminan_mutu_sertifikasi = sequelize.define('penjaminan_mutu_sertifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penjaminan_mutu_sertifikasi' });
  

penjaminan_mutu_sertifikasi.associate = (models) => {
  penjaminan_mutu_sertifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penjaminan_mutu_sertifikasi;
};
