export default (sequelize, DataTypes) => {
  const spj_pertanggungjawaban = sequelize.define('spj_pertanggungjawaban', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'spj_pertanggungjawaban' });
  

spj_pertanggungjawaban.associate = (models) => {
  spj_pertanggungjawaban.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return spj_pertanggungjawaban;
};
