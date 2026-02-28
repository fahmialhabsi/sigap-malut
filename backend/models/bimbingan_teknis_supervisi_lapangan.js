export default (sequelize, DataTypes) => {
  const bimbingan_teknis_supervisi_lapangan = sequelize.define('bimbingan_teknis_supervisi_lapangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimbingan_teknis_supervisi_lapangan' });
  

bimbingan_teknis_supervisi_lapangan.associate = (models) => {
  bimbingan_teknis_supervisi_lapangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimbingan_teknis_supervisi_lapangan;
};
