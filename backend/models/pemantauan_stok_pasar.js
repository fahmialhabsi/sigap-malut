export default (sequelize, DataTypes) => {
  const pemantauan_stok_pasar = sequelize.define('pemantauan_stok_pasar', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemantauan_stok_pasar' });
  

pemantauan_stok_pasar.associate = (models) => {
  pemantauan_stok_pasar.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemantauan_stok_pasar;
};
