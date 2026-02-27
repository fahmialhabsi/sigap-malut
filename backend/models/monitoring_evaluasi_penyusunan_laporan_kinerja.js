export default (sequelize, DataTypes) => {
  const monitoring_evaluasi_penyusunan_laporan_kinerja = sequelize.define('monitoring_evaluasi_penyusunan_laporan_kinerja', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_evaluasi_penyusunan_laporan_kinerja' });
  

monitoring_evaluasi_penyusunan_laporan_kinerja.associate = (models) => {
  monitoring_evaluasi_penyusunan_laporan_kinerja.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_evaluasi_penyusunan_laporan_kinerja;
};
