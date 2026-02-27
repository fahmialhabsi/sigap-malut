export default (sequelize, DataTypes) => {
  const penanganan_kerawanan_rencana_aksi = sequelize.define('penanganan_kerawanan_rencana_aksi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penanganan_kerawanan_rencana_aksi' });
  

penanganan_kerawanan_rencana_aksi.associate = (models) => {
  penanganan_kerawanan_rencana_aksi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penanganan_kerawanan_rencana_aksi;
};
