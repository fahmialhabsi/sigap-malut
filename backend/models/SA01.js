import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA01 = sequelize.define(
    "SA01",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nama_layanan: { type: DataTypes.STRING, allowNull: false },
      kode_layanan: { type: DataTypes.STRING, allowNull: false },
      bidang: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Super Admin",
      },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      sla: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "sa01", timestamps: true },
  );
  return SA01;
};
