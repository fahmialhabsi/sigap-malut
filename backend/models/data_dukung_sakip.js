export default (sequelize, DataTypes) => {
  const data_dukung_sakip = sequelize.define('data_dukung_sakip', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'data_dukung_sakip' });
  

data_dukung_sakip.associate = (models) => {
  data_dukung_sakip.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return data_dukung_sakip;
};
