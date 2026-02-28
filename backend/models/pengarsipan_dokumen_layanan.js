export default (sequelize, DataTypes) => {
  const pengarsipan_dokumen_layanan = sequelize.define('pengarsipan_dokumen_layanan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengarsipan_dokumen_layanan' });
  

pengarsipan_dokumen_layanan.associate = (models) => {
  pengarsipan_dokumen_layanan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengarsipan_dokumen_layanan;
};
