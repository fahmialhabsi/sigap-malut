export default (sequelize, DataTypes) => {
  const kendaraan_dinas = sequelize.define('kendaraan_dinas', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kendaraan_dinas' });
  

kendaraan_dinas.associate = (models) => {
  kendaraan_dinas.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kendaraan_dinas;
};
