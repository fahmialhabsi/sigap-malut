export default (sequelize, DataTypes) => {
  const kampanye_konsumsi_pangan_lokal = sequelize.define('kampanye_konsumsi_pangan_lokal', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kampanye_konsumsi_pangan_lokal' });
  

kampanye_konsumsi_pangan_lokal.associate = (models) => {
  kampanye_konsumsi_pangan_lokal.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kampanye_konsumsi_pangan_lokal;
};
