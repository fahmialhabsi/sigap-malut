export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("surat_masuk", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_agenda: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
      comment: "Auto-generated: AGD-2026-0001",
    },
    nomor_surat: { type: Sequelize.STRING(100), allowNull: true },
    tanggal_surat: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_terima: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    asal_surat: { type: Sequelize.STRING(255), allowNull: false },
    perihal: { type: Sequelize.TEXT, allowNull: false },
    isi_ringkas: { type: Sequelize.TEXT, allowNull: true },
    jenis_surat: {
      type: Sequelize.ENUM("Biasa", "Penting", "Rahasia", "Sangat Rahasia"),
      defaultValue: "Biasa",
    },
    sifat_surat: {
      type: Sequelize.ENUM("Segera", "Biasa", "Sangat Segera"),
      defaultValue: "Biasa",
    },
    media_terima: {
      type: Sequelize.ENUM("WA", "Email", "Pos", "Kurir", "Langsung", "SIPD"),
      defaultValue: "Langsung",
    },
    file_surat: { type: Sequelize.STRING(500), allowNull: true },
    file_lampiran: { type: Sequelize.JSON, allowNull: true },
    thumbnail_url: { type: Sequelize.STRING(500), allowNull: true },
    ai_status: {
      type: Sequelize.ENUM("pending", "processing", "done", "failed"),
      defaultValue: "pending",
    },
    ai_klasifikasi: { type: Sequelize.STRING(100), allowNull: true },
    ai_routing: { type: Sequelize.STRING(100), allowNull: true },
    ai_confidence: { type: Sequelize.FLOAT, allowNull: true },
    ai_ekstrak_data: { type: Sequelize.JSON, allowNull: true },
    ditujukan_kepada: { type: Sequelize.STRING(255), allowNull: true },
    status: {
      type: Sequelize.ENUM(
        "masuk",
        "disposisi",
        "proses",
        "selesai",
        "arsip",
      ),
      defaultValue: "masuk",
    },
    arsip_code: { type: Sequelize.STRING(50), allowNull: true },
    keterangan: { type: Sequelize.TEXT, allowNull: true },
    diterima_oleh: { type: Sequelize.INTEGER, allowNull: false },
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
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("surat_masuk");
};
