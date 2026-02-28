export default (sequelize, DataTypes) => {
  const pengendalian_mutu_audit = sequelize.define('pengendalian_mutu_audit', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengendalian_mutu_audit' });
  

pengendalian_mutu_audit.associate = (models) => {
  pengendalian_mutu_audit.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengendalian_mutu_audit;
};
