export async function up({ context: queryInterface }) {
  await queryInterface.createTable('SEK-LKT', {
      id: { type: DataTypes.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true },
      layanan_id: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "LY048" },
      periode: { type: DataTypes.DATEONLY, allowNull: false },
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      bulan: { type: DataTypes.INTEGER, allowNull: false },
      total_komoditas: { type: DataTypes.INTEGER, allowNull: true },
      total_stok: { type: DataTypes.DECIMAL, allowNull: true },
      stok_aman: { type: DataTypes.INTEGER, allowNull: true },
      stok_menipis: { type: DataTypes.INTEGER, allowNull: true },
      stok_kritis: { type: DataTypes.INTEGER, allowNull: true },
      wilayah_rawan_pangan: { type: DataTypes.INTEGER, allowNull: true },
      tingkat_kerawanan: { type: DataTypes.ENUM, allowNull: false, defaultValue: "Aman" },
      komoditas_kritis: { type: DataTypes.TEXT, allowNull: true },
      produksi_pangan_total: { type: DataTypes.DECIMAL, allowNull: true },
      konsumsi_estimasi: { type: DataTypes.DECIMAL, allowNull: true },
      surplus_defisit: { type: DataTypes.DECIMAL, allowNull: true },
      analisis: { type: DataTypes.TEXT, allowNull: true },
      rekomendasi: { type: DataTypes.TEXT, allowNull: true },
      sumber_data: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "Bidang Ketersediaan & Kerawanan Pangan" },
      file_laporan: { type: DataTypes.STRING(255), allowNull: true },
      file_data_pendukung: { type: DataTypes.JSONB, allowNull: true },
      penanggung_jawab: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "Sekretaris" },
      pelaksana: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "Bidang Ketersediaan" },
      is_sensitive: { type: DataTypes.ENUM, allowNull: false, defaultValue: "Biasa" },
      status: { type: DataTypes.ENUM, allowNull: false, defaultValue: "draft" },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('SEK-LKT');
}
