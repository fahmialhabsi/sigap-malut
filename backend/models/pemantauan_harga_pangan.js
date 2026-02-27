export default (sequelize, DataTypes) => {
  const pemantauan_harga_pangan = sequelize.define('pemantauan_harga_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemantauan_harga_pangan' });
  

pemantauan_harga_pangan.associate = (models) => {
  pemantauan_harga_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemantauan_harga_pangan;
};
