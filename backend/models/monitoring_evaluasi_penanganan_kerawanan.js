export default (sequelize, DataTypes) => {
  const monitoring_evaluasi_penanganan_kerawanan = sequelize.define('monitoring_evaluasi_penanganan_kerawanan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_evaluasi_penanganan_kerawanan' });
  

monitoring_evaluasi_penanganan_kerawanan.associate = (models) => {
  monitoring_evaluasi_penanganan_kerawanan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_evaluasi_penanganan_kerawanan;
};
