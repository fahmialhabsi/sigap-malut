export default (sequelize, DataTypes) => {
  const evaluasi_hasil_sertifikasi = sequelize.define('evaluasi_hasil_sertifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_hasil_sertifikasi' });
  

evaluasi_hasil_sertifikasi.associate = (models) => {
  evaluasi_hasil_sertifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_hasil_sertifikasi;
};
