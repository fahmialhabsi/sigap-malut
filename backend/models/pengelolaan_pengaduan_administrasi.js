export default (sequelize, DataTypes) => {
  const pengelolaan_pengaduan_administrasi = sequelize.define('pengelolaan_pengaduan_administrasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_pengaduan_administrasi' });
  

pengelolaan_pengaduan_administrasi.associate = (models) => {
  pengelolaan_pengaduan_administrasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_pengaduan_administrasi;
};
