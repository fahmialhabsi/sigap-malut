export default (sequelize, DataTypes) => {
  const laporan_kinerja = sequelize.define('laporan_kinerja', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_kinerja' });
  

laporan_kinerja.associate = (models) => {
  laporan_kinerja.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_kinerja;
};
