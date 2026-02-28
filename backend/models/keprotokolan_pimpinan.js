export default (sequelize, DataTypes) => {
  const keprotokolan_pimpinan = sequelize.define('keprotokolan_pimpinan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'keprotokolan_pimpinan' });
  

keprotokolan_pimpinan.associate = (models) => {
  keprotokolan_pimpinan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return keprotokolan_pimpinan;
};
