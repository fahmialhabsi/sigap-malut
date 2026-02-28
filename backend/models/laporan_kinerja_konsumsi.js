export default (sequelize, DataTypes) => {
  const laporan_kinerja_konsumsi = sequelize.define('laporan_kinerja_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_kinerja_konsumsi' });
  

laporan_kinerja_konsumsi.associate = (models) => {
  laporan_kinerja_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_kinerja_konsumsi;
};
