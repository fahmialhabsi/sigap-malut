export default (sequelize, DataTypes) => {
  const laporan_aset = sequelize.define('laporan_aset', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_aset' });
  

laporan_aset.associate = (models) => {
  laporan_aset.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_aset;
};
