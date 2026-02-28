export default (sequelize, DataTypes) => {
  const koordinasi_opd_terkait = sequelize.define('koordinasi_opd_terkait', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'koordinasi_opd_terkait' });
  

koordinasi_opd_terkait.associate = (models) => {
  koordinasi_opd_terkait.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return koordinasi_opd_terkait;
};
