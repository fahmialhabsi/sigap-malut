export default (sequelize, DataTypes) => {
  const penanganan_kerawanan_pangan_peta = sequelize.define('penanganan_kerawanan_pangan_peta', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penanganan_kerawanan_pangan_peta' });
  

penanganan_kerawanan_pangan_peta.associate = (models) => {
  penanganan_kerawanan_pangan_peta.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penanganan_kerawanan_pangan_peta;
};
