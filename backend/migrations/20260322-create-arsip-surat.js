export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("arsip_surat", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    kode_klasifikasi: { type: Sequelize.STRING(20), allowNull: false },
    nama_klasifikasi: { type: Sequelize.STRING(255), allowNull: true },
    referensi_type: {
      type: Sequelize.ENUM("surat_masuk", "surat_keluar"),
      allowNull: false,
    },
    referensi_id: { type: Sequelize.INTEGER, allowNull: false },
    nomor_berkas: { type: Sequelize.STRING(100), allowNull: true },
    lokasi_fisik: { type: Sequelize.STRING(255), allowNull: true },
    file_digital: { type: Sequelize.STRING(500), allowNull: true },
    retensi_aktif: { type: Sequelize.INTEGER, allowNull: true },
    retensi_inaktif: { type: Sequelize.INTEGER, allowNull: true },
    nasib_akhir: {
      type: Sequelize.ENUM("Permanen", "Musnah", "Dinilai Kembali"),
      defaultValue: "Dinilai Kembali",
    },
    tanggal_arsip: {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    diarsipkan_oleh: { type: Sequelize.INTEGER, allowNull: true },
    keterangan: { type: Sequelize.TEXT, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("arsip_surat");
};
