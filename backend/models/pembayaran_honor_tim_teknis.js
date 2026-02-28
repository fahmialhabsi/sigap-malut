export default (sequelize, DataTypes) => {
  const pembayaran_honor_tim_teknis = sequelize.define('pembayaran_honor_tim_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pembayaran_honor_tim_teknis' });
  

pembayaran_honor_tim_teknis.associate = (models) => {
  pembayaran_honor_tim_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pembayaran_honor_tim_teknis;
};
