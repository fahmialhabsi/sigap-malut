export default (sequelize, DataTypes) => {
  const pelatihan_pengolahan_pangan_lokal = sequelize.define('pelatihan_pengolahan_pangan_lokal', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelatihan_pengolahan_pangan_lokal' });
  

pelatihan_pengolahan_pangan_lokal.associate = (models) => {
  pelatihan_pengolahan_pangan_lokal.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelatihan_pengolahan_pangan_lokal;
};
