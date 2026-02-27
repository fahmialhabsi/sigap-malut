export default (sequelize, DataTypes) => {
  const edukasi_b2sa = sequelize.define('edukasi_b2sa', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'edukasi_b2sa' });
  

edukasi_b2sa.associate = (models) => {
  edukasi_b2sa.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return edukasi_b2sa;
};
