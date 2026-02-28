export default (sequelize, DataTypes) => {
  const bimbingan_teknis_bimtek_pemetaan = sequelize.define('bimbingan_teknis_bimtek_pemetaan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimbingan_teknis_bimtek_pemetaan' });
  

bimbingan_teknis_bimtek_pemetaan.associate = (models) => {
  bimbingan_teknis_bimtek_pemetaan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimbingan_teknis_bimtek_pemetaan;
};
