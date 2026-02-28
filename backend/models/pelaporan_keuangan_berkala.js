export default (sequelize, DataTypes) => {
  const pelaporan_keuangan_berkala = sequelize.define('pelaporan_keuangan_berkala', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelaporan_keuangan_berkala' });
  

pelaporan_keuangan_berkala.associate = (models) => {
  pelaporan_keuangan_berkala.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelaporan_keuangan_berkala;
};
