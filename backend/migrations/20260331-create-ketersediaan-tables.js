// Prompt 11: Bidang Ketersediaan & Kerawanan Pangan (M033–M036 + EWS)
// Catatan: target utama SQLite. Gunakan kolom bertipe STRING untuk ENUM agar kompatibel lintas dialect.
export const up = async (queryInterface, Sequelize) => {
  // M033: produksi_pangan
  await queryInterface.createTable("produksi_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode_bulan: { type: Sequelize.TINYINT, allowNull: false },
    periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    komoditas_id: { type: Sequelize.INTEGER, allowNull: false },
    volume_produksi: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
    satuan: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "ton" },
    sumber_data: { type: Sequelize.STRING(30), allowNull: false }, // survei_lapangan|dinas_pertanian|bps|estimasi
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" }, // draft|terverifikasi|disetujui
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("produksi_pangan", [
    "periode_tahun",
    "periode_bulan",
    "kabupaten_kota",
    "komoditas_id",
  ]);

  // M034: stok_pangan
  await queryInterface.createTable("stok_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    tanggal_update: { type: Sequelize.DATEONLY, allowNull: false },
    lokasi_gudang: { type: Sequelize.STRING(255), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    komoditas_id: { type: Sequelize.INTEGER, allowNull: false },
    volume_stok: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
    satuan: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "ton" },
    estimasi_hari: { type: Sequelize.INTEGER, allowNull: true },
    status_stok: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "aman" }, // aman|waspada|kritis
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("stok_pangan", [
    "tanggal_update",
    "kabupaten_kota",
    "komoditas_id",
  ]);

  // M035: neraca_pangan
  await queryInterface.createTable("neraca_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode: { type: Sequelize.STRING(20), allowNull: false }, // 2026-Q1|2026-S1|2026
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    komoditas_id: { type: Sequelize.INTEGER, allowNull: false },
    produksi: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    impor: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    ekspor: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    susut_tercecer: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    ketersediaan: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    kebutuhan: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    surplus_defisit: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" }, // draft|final
    disusun_oleh: { type: Sequelize.INTEGER, allowNull: false },
    disetujui_oleh: { type: Sequelize.INTEGER, allowNull: true }, // Kabid
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("neraca_pangan", [
    "periode",
    "kabupaten_kota",
    "komoditas_id",
  ]);

  // M036: kerawanan_pangan
  await queryInterface.createTable("kerawanan_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode: { type: Sequelize.STRING(20), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    kecamatan: { type: Sequelize.STRING(100), allowNull: true },
    skor_kerawanan: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    status_kerawanan: { type: Sequelize.STRING(20), allowNull: false }, // aman|waspada|rawan|sangat_rawan
    aspek_stok: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    aspek_akses: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    aspek_pemanfaatan: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    aspek_stabilitas: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    jumlah_penduduk_terdampak: { type: Sequelize.INTEGER, allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("kerawanan_pangan", ["periode", "kabupaten_kota"]);

  // EWS: ews_ketersediaan
  await queryInterface.createTable("ews_ketersediaan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    tanggal_alert: { type: Sequelize.DATEONLY, allowNull: false },
    jenis_indikator: { type: Sequelize.STRING(30), allowNull: false }, // stok_beras|produksi_padi|wilayah_rawan|harga_pangan|distribusi|bencana
    nilai_aktual: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    threshold: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    level_alert: { type: Sequelize.STRING(20), allowNull: false }, // informasi|warning|kritis
    deskripsi: { type: Sequelize.TEXT, allowNull: false },
    rekomendasi: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "aktif" }, // aktif|ditangani|selesai
    dikirim_ke_kadin: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("ews_ketersediaan", ["tanggal_alert", "jenis_indikator", "level_alert"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("ews_ketersediaan");
  await queryInterface.dropTable("kerawanan_pangan");
  await queryInterface.dropTable("neraca_pangan");
  await queryInterface.dropTable("stok_pangan");
  await queryInterface.dropTable("produksi_pangan");
};

