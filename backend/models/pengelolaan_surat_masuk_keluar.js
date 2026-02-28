export default (sequelize, DataTypes) => {
  const pengelolaan_surat_masuk_keluar = sequelize.define('pengelolaan_surat_masuk_keluar', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_surat_masuk_keluar' });
  

pengelolaan_surat_masuk_keluar.associate = (models) => {
  pengelolaan_surat_masuk_keluar.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_surat_masuk_keluar;
};
