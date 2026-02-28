export default (sequelize, DataTypes) => {
  const lkjip_lakip = sequelize.define('lkjip_lakip', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'lkjip_lakip' });
  

lkjip_lakip.associate = (models) => {
  lkjip_lakip.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return lkjip_lakip;
};
