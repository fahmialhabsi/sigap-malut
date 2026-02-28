export default (sequelize, DataTypes) => {
  const neraca_pangan_daerah = sequelize.define('neraca_pangan_daerah', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'neraca_pangan_daerah' });
  

neraca_pangan_daerah.associate = (models) => {
  neraca_pangan_daerah.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return neraca_pangan_daerah;
};
