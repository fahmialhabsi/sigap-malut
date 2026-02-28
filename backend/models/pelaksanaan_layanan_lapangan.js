export default (sequelize, DataTypes) => {
  const pelaksanaan_layanan_lapangan = sequelize.define('pelaksanaan_layanan_lapangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelaksanaan_layanan_lapangan' });
  

pelaksanaan_layanan_lapangan.associate = (models) => {
  pelaksanaan_layanan_lapangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelaksanaan_layanan_lapangan;
};
