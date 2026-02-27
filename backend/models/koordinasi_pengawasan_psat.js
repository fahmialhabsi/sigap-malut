export default (sequelize, DataTypes) => {
  const koordinasi_pengawasan_psat = sequelize.define('koordinasi_pengawasan_psat', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'koordinasi_pengawasan_psat' });
  

koordinasi_pengawasan_psat.associate = (models) => {
  koordinasi_pengawasan_psat.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return koordinasi_pengawasan_psat;
};
