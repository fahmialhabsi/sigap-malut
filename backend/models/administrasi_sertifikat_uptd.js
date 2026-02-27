export default (sequelize, DataTypes) => {
  const administrasi_sertifikat_uptd = sequelize.define('administrasi_sertifikat_uptd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'administrasi_sertifikat_uptd' });
  

administrasi_sertifikat_uptd.associate = (models) => {
  administrasi_sertifikat_uptd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return administrasi_sertifikat_uptd;
};
