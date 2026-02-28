export default (sequelize, DataTypes) => {
  const pendampingan_kelompok_pangan = sequelize.define('pendampingan_kelompok_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pendampingan_kelompok_pangan' });
  

pendampingan_kelompok_pangan.associate = (models) => {
  pendampingan_kelompok_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pendampingan_kelompok_pangan;
};
