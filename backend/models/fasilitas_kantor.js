export default (sequelize, DataTypes) => {
  const fasilitas_kantor = sequelize.define('fasilitas_kantor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitas_kantor' });
  

fasilitas_kantor.associate = (models) => {
  fasilitas_kantor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return fasilitas_kantor;
};
