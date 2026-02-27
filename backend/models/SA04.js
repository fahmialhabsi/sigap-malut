import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA04 = sequelize.define(
    "SA04",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      judul_peraturan: { type: DataTypes.STRING, allowNull: false },
      kode_peraturan: { type: DataTypes.STRING, allowNull: false },
      bidang: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Super Admin",
      },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "aktif" },
      file_path: { type: DataTypes.STRING, allowNull: true },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "sa04", timestamps: true },
  );
  return SA04;
};
