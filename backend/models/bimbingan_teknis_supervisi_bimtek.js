export default (sequelize, DataTypes) => {
  const bimbingan_teknis_supervisi_bimtek = sequelize.define('bimbingan_teknis_supervisi_bimtek', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimbingan_teknis_supervisi_bimtek' });
  

bimbingan_teknis_supervisi_bimtek.associate = (models) => {
  bimbingan_teknis_supervisi_bimtek.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimbingan_teknis_supervisi_bimtek;
};
