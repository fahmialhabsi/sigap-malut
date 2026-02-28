export default (sequelize, DataTypes) => {
  const laporan_kinerja_distribusi = sequelize.define('laporan_kinerja_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_kinerja_distribusi' });
  

laporan_kinerja_distribusi.associate = (models) => {
  laporan_kinerja_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_kinerja_distribusi;
};
