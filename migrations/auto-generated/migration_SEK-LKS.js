export async function up({ context: queryInterface }) {
  await queryInterface.createTable('SEK-LKS', {
      id: { type: DataTypes.INTEGER, allowNull: false, unique: true, autoIncrement: true, primaryKey: true },
      layanan_id: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "LY050" },
      periode: { type: DataTypes.DATEONLY, allowNull: false },
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      bulan: { type: DataTypes.INTEGER, allowNull: false },
      skor_pph: { type: DataTypes.DECIMAL, allowNull: true },
      target_pph: { type: DataTypes.DECIMAL, allowNull: true, defaultValue: "90" },
      status_pph: { type: DataTypes.ENUM, allowNull: true },
      konsumsi_kalori_per_kapita: { type: DataTypes.DECIMAL, allowNull: true },
      konsumsi_protein_per_kapita: { type: DataTypes.DECIMAL, allowNull: true },
      total_penerima_sppg: { type: DataTypes.INTEGER, allowNull: true },
      distribusi_sppg_realisasi: { type: DataTypes.DECIMAL, allowNull: true },
      program_mbg_penerima: { type: DataTypes.INTEGER, allowNull: true },
      program_diversifikasi: { type: DataTypes.INTEGER, allowNull: true },
      inspeksi_keamanan_pangan: { type: DataTypes.INTEGER, allowNull: true },
      pangan_aman: { type: DataTypes.INTEGER, allowNull: true },
      pangan_tidak_aman: { type: DataTypes.INTEGER, allowNull: true },
      kasus_keracunan: { type: DataTypes.INTEGER, allowNull: true, defaultValue: "0" },
      korban_keracunan: { type: DataTypes.INTEGER, allowNull: true, defaultValue: "0" },
      tindakan_terhadap_keracunan: { type: DataTypes.TEXT, allowNull: true },
      edukasi_dilakukan: { type: DataTypes.INTEGER, allowNull: true },
      peserta_edukasi: { type: DataTypes.INTEGER, allowNull: true },
      analisis: { type: DataTypes.TEXT, allowNull: true },
      rekomendasi: { type: DataTypes.TEXT, allowNull: true },
      sumber_data: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "Bidang Konsumsi & Keamanan Pangan" },
      file_laporan: { type: DataTypes.STRING(255), allowNull: true },
      file_data_pendukung: { type: DataTypes.JSONB, allowNull: true },
      penanggung_jawab: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "Sekretaris" },
      pelaksana: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "Bidang Konsumsi" },
      is_sensitive: { type: DataTypes.ENUM, allowNull: false, defaultValue: "Biasa" },
      status: { type: DataTypes.ENUM, allowNull: false, defaultValue: "draft" },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "CURRENT_TIMESTAMP" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('SEK-LKS');
}
