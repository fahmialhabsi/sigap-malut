import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SuratKeluar =
  sequelize.models.SuratKeluar ||
  sequelize.define(
    "SuratKeluar",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nomor_surat: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: "Auto: 042/ST/DP-MALUT/III/2026",
      },
      draft_nomor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      jenis_naskah: {
        type: DataTypes.ENUM(
          "SK",
          "SE",
          "ST",
          "SU",
          "ND",
          "MEMO",
          "BA",
          "LAP",
          "SP",
          "SKET",
          "Lainnya",
        ),
        allowNull: false,
      },
      tanggal_surat: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      kepada: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tembusan: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      perihal: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isi_surat: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dasar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      template_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      file_draft: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      file_final: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      file_lampiran: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      penandatangan: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      jabatan_ttd: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tanggal_ttd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "review",
          "approved",
          "signed",
          "sent",
          "arsip",
          "batal",
        ),
        defaultValue: "draft",
      },
      arsip_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dibuat_oleh: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_pembuat: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "surat_keluar",
      timestamps: true,
      underscored: true,
    },
  );

export default SuratKeluar;
