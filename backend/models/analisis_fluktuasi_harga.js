export default (sequelize, DataTypes) => {
  const analisis_fluktuasi_harga = sequelize.define('analisis_fluktuasi_harga', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'analisis_fluktuasi_harga' });
  

analisis_fluktuasi_harga.associate = (models) => {
  analisis_fluktuasi_harga.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return analisis_fluktuasi_harga;
};
