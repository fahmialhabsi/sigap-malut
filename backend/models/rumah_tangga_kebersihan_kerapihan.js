export default (sequelize, DataTypes) => {
  const rumah_tangga_kebersihan_kerapihan = sequelize.define('rumah_tangga_kebersihan_kerapihan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rumah_tangga_kebersihan_kerapihan' });
  

rumah_tangga_kebersihan_kerapihan.associate = (models) => {
  rumah_tangga_kebersihan_kerapihan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rumah_tangga_kebersihan_kerapihan;
};
