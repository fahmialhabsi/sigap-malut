export default (sequelize, DataTypes) => {
  const penanganan_kerawanan_pangan_identifikasi = sequelize.define('penanganan_kerawanan_pangan_identifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penanganan_kerawanan_pangan_identifikasi' });
  

penanganan_kerawanan_pangan_identifikasi.associate = (models) => {
  penanganan_kerawanan_pangan_identifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penanganan_kerawanan_pangan_identifikasi;
};
