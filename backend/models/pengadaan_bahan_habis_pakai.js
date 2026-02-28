export default (sequelize, DataTypes) => {
  const pengadaan_bahan_habis_pakai = sequelize.define('pengadaan_bahan_habis_pakai', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengadaan_bahan_habis_pakai' });
  

pengadaan_bahan_habis_pakai.associate = (models) => {
  pengadaan_bahan_habis_pakai.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengadaan_bahan_habis_pakai;
};
