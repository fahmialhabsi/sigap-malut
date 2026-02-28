export default (sequelize, DataTypes) => {
  const penyusunan_sop_sertifikasi = sequelize.define('penyusunan_sop_sertifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_sop_sertifikasi' });
  

penyusunan_sop_sertifikasi.associate = (models) => {
  penyusunan_sop_sertifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_sop_sertifikasi;
};
