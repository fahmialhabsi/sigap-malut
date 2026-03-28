import { DataTypes } from "sequelize";

export default function SkpPenilaianModel(sequelize) {
  const SkpPenilaian = sequelize.define(
    "SkpPenilaian",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pegawai_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      penilai_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      periode_tahun: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      periode_semester: {
        type: DataTypes.ENUM("1", "2"),
        allowNull: false,
        defaultValue: "1",
      },
      unit_kerja: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      jabatan: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "submitted", "reviewed", "approved", "signed"),
        allowNull: false,
        defaultValue: "draft",
      },
      nilai_kuantitatif: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      nilai_kualitatif: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      catatan_penilai: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      catatan_pegawai: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      signed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "skp_penilaian",
      underscored: true,
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  SkpPenilaian.associate = (models) => {
    SkpPenilaian.belongsTo(models.User, {
      foreignKey: "pegawai_id",
      as: "pegawai",
    });
    if (models.User) {
      SkpPenilaian.belongsTo(models.User, {
        foreignKey: "penilai_id",
        as: "penilai",
      });
    }
  };

  return SkpPenilaian;
}
