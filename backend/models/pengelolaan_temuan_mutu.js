export default (sequelize, DataTypes) => {
  const pengelolaan_temuan_mutu = sequelize.define('pengelolaan_temuan_mutu', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_temuan_mutu' });
  

pengelolaan_temuan_mutu.associate = (models) => {
  pengelolaan_temuan_mutu.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_temuan_mutu;
};
