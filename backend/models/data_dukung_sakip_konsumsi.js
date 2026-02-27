export default (sequelize, DataTypes) => {
  const data_dukung_sakip_konsumsi = sequelize.define('data_dukung_sakip_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'data_dukung_sakip_konsumsi' });
  

data_dukung_sakip_konsumsi.associate = (models) => {
  data_dukung_sakip_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return data_dukung_sakip_konsumsi;
};
