import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const SEK-ADM = sequelize.define(
  'SEK-ADM', {
    id: { type: DataTypes.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true },
    unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "Sekretariat" },
    layanan_id: { type: DataTypes.STRING(10), allowNull: false },
    nomor_surat: { type: DataTypes.STRING(100), allowNull: true },
    jenis_naskah: { type: DataTypes.ENUM, allowNull: true },
    tanggal_surat: { type: DataTypes.DATEONLY, allowNull: false },
    pengirim_penerima: { type: DataTypes.STRING(255), allowNull: true },
    perihal: { type: DataTypes.TEXT, allowNull: false },
    isi_ringkas: { type: DataTypes.TEXT, allowNull: true },
    disposisi: { type: DataTypes.TEXT, allowNull: true },
    ditujukan_kepada: { type: DataTypes.STRING(255), allowNull: true },
    file_surat: { type: DataTypes.STRING(255), allowNull: true },
    file_lampiran: { type: DataTypes.JSONB, allowNull: true },
    arsip_code: { type: DataTypes.STRING(50), allowNull: true },
    is_rahasia: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "0" },
    penanggung_jawab: { type: DataTypes.STRING(255), allowNull: false },
    pelaksana: { type: DataTypes.STRING(255), allowNull: false },
    is_sensitive: { type: DataTypes.ENUM, allowNull: false, defaultValue: "Biasa" },
    status: { type: DataTypes.ENUM, allowNull: false, defaultValue: "pending" },
    keterangan: { type: DataTypes.TEXT, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
  }, { tableName: 'SEK-ADM', timestamps: false });

export default SEK-ADM;
