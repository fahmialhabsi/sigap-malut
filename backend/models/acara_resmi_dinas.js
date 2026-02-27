export default (sequelize, DataTypes) => {
  const acara_resmi_dinas = sequelize.define('acara_resmi_dinas', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'acara_resmi_dinas' });
  

acara_resmi_dinas.associate = (models) => {
  acara_resmi_dinas.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return acara_resmi_dinas;
};
