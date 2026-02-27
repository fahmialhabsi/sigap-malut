export default (sequelize, DataTypes) => {
  const inspeksi_lapangan = sequelize.define('inspeksi_lapangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'inspeksi_lapangan' });
  

inspeksi_lapangan.associate = (models) => {
  inspeksi_lapangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return inspeksi_lapangan;
};
