export default (sequelize, DataTypes) => {
  const monitoring_evaluasi_penyusunan_laporan_teknis = sequelize.define('monitoring_evaluasi_penyusunan_laporan_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_evaluasi_penyusunan_laporan_teknis' });
  

monitoring_evaluasi_penyusunan_laporan_teknis.associate = (models) => {
  monitoring_evaluasi_penyusunan_laporan_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_evaluasi_penyusunan_laporan_teknis;
};
