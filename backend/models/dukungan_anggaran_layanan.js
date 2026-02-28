export default (sequelize, DataTypes) => {
  const dukungan_anggaran_layanan = sequelize.define('dukungan_anggaran_layanan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'dukungan_anggaran_layanan' });
  

dukungan_anggaran_layanan.associate = (models) => {
  dukungan_anggaran_layanan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return dukungan_anggaran_layanan;
};
