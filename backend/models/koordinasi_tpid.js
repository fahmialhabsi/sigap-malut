export default (sequelize, DataTypes) => {
  const koordinasi_tpid = sequelize.define('koordinasi_tpid', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'koordinasi_tpid' });
  

koordinasi_tpid.associate = (models) => {
  koordinasi_tpid.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return koordinasi_tpid;
};
