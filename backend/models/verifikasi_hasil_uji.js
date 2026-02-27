export default (sequelize, DataTypes) => {
  const verifikasi_hasil_uji = sequelize.define('verifikasi_hasil_uji', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'verifikasi_hasil_uji' });
  

verifikasi_hasil_uji.associate = (models) => {
  verifikasi_hasil_uji.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return verifikasi_hasil_uji;
};
