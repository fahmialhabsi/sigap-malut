export default (sequelize, DataTypes) => {
  const pelaporan_kegiatan_teknis_uptd = sequelize.define('pelaporan_kegiatan_teknis_uptd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelaporan_kegiatan_teknis_uptd' });
  

pelaporan_kegiatan_teknis_uptd.associate = (models) => {
  pelaporan_kegiatan_teknis_uptd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelaporan_kegiatan_teknis_uptd;
};
