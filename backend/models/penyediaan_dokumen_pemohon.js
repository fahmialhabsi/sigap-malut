export default (sequelize, DataTypes) => {
  const penyediaan_dokumen_pemohon = sequelize.define('penyediaan_dokumen_pemohon', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyediaan_dokumen_pemohon' });
  

penyediaan_dokumen_pemohon.associate = (models) => {
  penyediaan_dokumen_pemohon.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyediaan_dokumen_pemohon;
};
