export default (sequelize, DataTypes) => {
  const keamanan_kantor = sequelize.define('keamanan_kantor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'keamanan_kantor' });
  

keamanan_kantor.associate = (models) => {
  keamanan_kantor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return keamanan_kantor;
};
