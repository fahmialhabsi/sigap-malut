export default (sequelize, DataTypes) => {
  const rekapitulasi_ringkasan_laporan_semua_bidang = sequelize.define('rekapitulasi_ringkasan_laporan_semua_bidang', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rekapitulasi_ringkasan_laporan_semua_bidang' });
  

rekapitulasi_ringkasan_laporan_semua_bidang.associate = (models) => {
  rekapitulasi_ringkasan_laporan_semua_bidang.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rekapitulasi_ringkasan_laporan_semua_bidang;
};
