export default (sequelize, DataTypes) => {
  const pengembangan_pangan_lokal = sequelize.define('pengembangan_pangan_lokal', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengembangan_pangan_lokal' });
  

pengembangan_pangan_lokal.associate = (models) => {
  pengembangan_pangan_lokal.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengembangan_pangan_lokal;
};
