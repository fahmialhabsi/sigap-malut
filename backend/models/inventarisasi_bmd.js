export default (sequelize, DataTypes) => {
  const inventarisasi_bmd = sequelize.define('inventarisasi_bmd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'inventarisasi_bmd' });
  

inventarisasi_bmd.associate = (models) => {
  inventarisasi_bmd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return inventarisasi_bmd;
};
