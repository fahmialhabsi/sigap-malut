export default (sequelize, DataTypes) => {
  const pemantauan_arus_distribusi = sequelize.define('pemantauan_arus_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemantauan_arus_distribusi' });
  

pemantauan_arus_distribusi.associate = (models) => {
  pemantauan_arus_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemantauan_arus_distribusi;
};
