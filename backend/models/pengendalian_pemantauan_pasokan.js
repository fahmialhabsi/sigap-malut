export default (sequelize, DataTypes) => {
  const pengendalian_pemantauan_pasokan = sequelize.define('pengendalian_pemantauan_pasokan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengendalian_pemantauan_pasokan' });
  

pengendalian_pemantauan_pasokan.associate = (models) => {
  pengendalian_pemantauan_pasokan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengendalian_pemantauan_pasokan;
};
