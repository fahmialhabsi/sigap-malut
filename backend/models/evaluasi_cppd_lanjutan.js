export default (sequelize, DataTypes) => {
  const evaluasi_cppd_lanjutan = sequelize.define('evaluasi_cppd_lanjutan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_cppd_lanjutan' });
  

evaluasi_cppd_lanjutan.associate = (models) => {
  evaluasi_cppd_lanjutan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_cppd_lanjutan;
};
