export default (sequelize, DataTypes) => {
  const ruang_rapat_kegiatan = sequelize.define('ruang_rapat_kegiatan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'ruang_rapat_kegiatan' });
  

ruang_rapat_kegiatan.associate = (models) => {
  ruang_rapat_kegiatan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return ruang_rapat_kegiatan;
};
