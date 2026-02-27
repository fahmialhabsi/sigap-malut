export default (sequelize, DataTypes) => {
  const pemanfaatan_pekarangan = sequelize.define('pemanfaatan_pekarangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemanfaatan_pekarangan' });
  

pemanfaatan_pekarangan.associate = (models) => {
  pemanfaatan_pekarangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemanfaatan_pekarangan;
};
