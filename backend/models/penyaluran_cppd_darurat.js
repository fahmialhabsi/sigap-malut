export default (sequelize, DataTypes) => {
  const penyaluran_cppd_darurat = sequelize.define('penyaluran_cppd_darurat', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyaluran_cppd_darurat' });
  

penyaluran_cppd_darurat.associate = (models) => {
  penyaluran_cppd_darurat.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyaluran_cppd_darurat;
};
