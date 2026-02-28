export default (sequelize, DataTypes) => {
  const kebijakan_penganekaragaman_pangan = sequelize.define('kebijakan_penganekaragaman_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_penganekaragaman_pangan' });
  

kebijakan_penganekaragaman_pangan.associate = (models) => {
  kebijakan_penganekaragaman_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_penganekaragaman_pangan;
};
