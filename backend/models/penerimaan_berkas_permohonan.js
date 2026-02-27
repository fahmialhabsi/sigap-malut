export default (sequelize, DataTypes) => {
  const penerimaan_berkas_permohonan = sequelize.define('penerimaan_berkas_permohonan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penerimaan_berkas_permohonan' });
  

penerimaan_berkas_permohonan.associate = (models) => {
  penerimaan_berkas_permohonan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penerimaan_berkas_permohonan;
};
