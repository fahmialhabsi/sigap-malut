// Tabel Analisa JF Ketersediaan
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AnalisaJfKetersediaan = sequelize.define('AnalisaJfKetersediaan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  jf_id: { type: DataTypes.INTEGER, allowNull: false },
  judul: { type: DataTypes.STRING(255), allowNull: false },
  jenis: {
    type: DataTypes.ENUM('analisa_ketersediaan', 'analisa_kerawanan', 'neraca_pangan', 'laporan_bimtek', 'rekomendasi'),
    allowNull: false
  },
  isi_analisa: { type: DataTypes.TEXT, allowNull: false },
  periode: { type: DataTypes.STRING(20) },
  referensi_data: { type: DataTypes.JSON },
  dokumen_url: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.ENUM('draft', 'diajukan_kabid', 'dikembalikan', 'disetujui'),
    defaultValue: 'draft'
  },
  catatan_kabid: { type: DataTypes.TEXT },
  diajukan_at: { type: DataTypes.DATE },
  disetujui_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'analisa_jf_ketersediaan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AnalisaJfKetersediaan;
