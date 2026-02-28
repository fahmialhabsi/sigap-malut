export default (sequelize, DataTypes) => {
  const pemeliharaan_peralatan_lab = sequelize.define('pemeliharaan_peralatan_lab', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemeliharaan_peralatan_lab' });
  

pemeliharaan_peralatan_lab.associate = (models) => {
  pemeliharaan_peralatan_lab.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemeliharaan_peralatan_lab;
};
