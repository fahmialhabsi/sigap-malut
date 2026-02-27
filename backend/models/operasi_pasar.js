export default (sequelize, DataTypes) => {
  const operasi_pasar = sequelize.define('operasi_pasar', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'operasi_pasar' });
  

operasi_pasar.associate = (models) => {
  operasi_pasar.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return operasi_pasar;
};
