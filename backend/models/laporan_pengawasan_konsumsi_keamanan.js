export default (sequelize, DataTypes) => {
  const laporan_pengawasan_konsumsi_keamanan = sequelize.define('laporan_pengawasan_konsumsi_keamanan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_pengawasan_konsumsi_keamanan' });
  

laporan_pengawasan_konsumsi_keamanan.associate = (models) => {
  laporan_pengawasan_konsumsi_keamanan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_pengawasan_konsumsi_keamanan;
};
