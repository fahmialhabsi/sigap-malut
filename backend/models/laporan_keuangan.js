export default (sequelize, DataTypes) => {
  const laporan_keuangan = sequelize.define('laporan_keuangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_keuangan' });
  

laporan_keuangan.associate = (models) => {
  laporan_keuangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_keuangan;
};
