export default (sequelize, DataTypes) => {
  const sinkronisasi_kebijakan_distribusi = sequelize.define('sinkronisasi_kebijakan_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sinkronisasi_kebijakan_distribusi' });
  

sinkronisasi_kebijakan_distribusi.associate = (models) => {
  sinkronisasi_kebijakan_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sinkronisasi_kebijakan_distribusi;
};
