export default (sequelize, DataTypes) => {
  const evaluasi_stabilisasi_harga = sequelize.define('evaluasi_stabilisasi_harga', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_stabilisasi_harga' });
  

evaluasi_stabilisasi_harga.associate = (models) => {
  evaluasi_stabilisasi_harga.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_stabilisasi_harga;
};
