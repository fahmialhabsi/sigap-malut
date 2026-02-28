export default (sequelize, DataTypes) => {
  const pengendalian_pemantauan_produksi = sequelize.define('pengendalian_pemantauan_produksi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengendalian_pemantauan_produksi' });
  

pengendalian_pemantauan_produksi.associate = (models) => {
  pengendalian_pemantauan_produksi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengendalian_pemantauan_produksi;
};
