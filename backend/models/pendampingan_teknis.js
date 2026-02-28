export default (sequelize, DataTypes) => {
  const pendampingan_teknis = sequelize.define('pendampingan_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pendampingan_teknis' });
  

pendampingan_teknis.associate = (models) => {
  pendampingan_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pendampingan_teknis;
};
