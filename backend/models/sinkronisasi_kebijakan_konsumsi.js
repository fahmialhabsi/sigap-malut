export default (sequelize, DataTypes) => {
  const sinkronisasi_kebijakan_konsumsi = sequelize.define('sinkronisasi_kebijakan_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sinkronisasi_kebijakan_konsumsi' });
  

sinkronisasi_kebijakan_konsumsi.associate = (models) => {
  sinkronisasi_kebijakan_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sinkronisasi_kebijakan_konsumsi;
};
