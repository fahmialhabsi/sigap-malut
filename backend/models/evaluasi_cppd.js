export default (sequelize, DataTypes) => {
  const evaluasi_cppd = sequelize.define('evaluasi_cppd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_cppd' });
  

evaluasi_cppd.associate = (models) => {
  evaluasi_cppd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_cppd;
};
