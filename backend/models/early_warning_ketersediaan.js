export default (sequelize, DataTypes) => {
  const early_warning_ketersediaan = sequelize.define('early_warning_ketersediaan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'early_warning_ketersediaan' });
  

early_warning_ketersediaan.associate = (models) => {
  early_warning_ketersediaan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return early_warning_ketersediaan;
};
