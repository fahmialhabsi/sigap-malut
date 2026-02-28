export default (sequelize, DataTypes) => {
  const laporan_stok_kerawanan_pangan = sequelize.define('laporan_stok_kerawanan_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'laporan_stok_kerawanan_pangan' });
  

laporan_stok_kerawanan_pangan.associate = (models) => {
  laporan_stok_kerawanan_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return laporan_stok_kerawanan_pangan;
};
