export default (sequelize, DataTypes) => {
  const pensiun_purna_bakti = sequelize.define(
    "pensiun_purna_bakti",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      layanan_id: { type: DataTypes.UUID, allowNull: false },
      kode_layanan: { type: DataTypes.STRING, allowNull: false },
      nama_layanan: { type: DataTypes.STRING, allowNull: false },
      bidang_penanggung_jawab: { type: DataTypes.STRING, allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      jenis_output: { type: DataTypes.STRING, allowNull: false },
      sla: { type: DataTypes.INTEGER, allowNull: false },
      aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "pensiun_purna_bakti", timestamps: true },
  );
  

pensiun_purna_bakti.associate = (models) => {
  pensiun_purna_bakti.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pensiun_purna_bakti;
};
