export default (sequelize, DataTypes) => {
  const pencairan_anggaran = sequelize.define('pencairan_anggaran', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pencairan_anggaran' });
  

pencairan_anggaran.associate = (models) => {
  pencairan_anggaran.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pencairan_anggaran;
};
