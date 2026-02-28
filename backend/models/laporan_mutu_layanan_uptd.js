export default (sequelize, DataTypes) => {
  const laporan_mutu_layanan_uptd = sequelize.define('laporan_mutu_layanan_uptd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_mutu_layanan_uptd' });
  

laporan_mutu_layanan_uptd.associate = (models) => {
  laporan_mutu_layanan_uptd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_mutu_layanan_uptd;
};
