export default (sequelize, DataTypes) => {
  const legalitas_administrasi_sertifikasi = sequelize.define('legalitas_administrasi_sertifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'legalitas_administrasi_sertifikasi' });
  

legalitas_administrasi_sertifikasi.associate = (models) => {
  legalitas_administrasi_sertifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return legalitas_administrasi_sertifikasi;
};
