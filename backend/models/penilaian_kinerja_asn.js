export default (sequelize, DataTypes) => {
  const penilaian_kinerja_asn = sequelize.define(
    "penilaian_kinerja_asn",
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
    { tableName: "penilaian_kinerja_asn", timestamps: true },
  );
  

penilaian_kinerja_asn.associate = (models) => {
  penilaian_kinerja_asn.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penilaian_kinerja_asn;
};
