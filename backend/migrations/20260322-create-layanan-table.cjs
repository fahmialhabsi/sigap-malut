// Migration: Create layanan table sesuai dokumenSistem (UUID PK, kode_layanan, nama_layanan, bidang_penanggung_jawab, deskripsi, jenis_output, SLA, aktif, created_at, updated_at)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("layanan", {
      id_layanan: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      kode_layanan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nama_layanan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bidang_penanggung_jawab: {
        type: Sequelize.STRING,
        allowNull: false,
        // FK ke bidang (opsional, bisa ditambah constraint FK jika tabel bidang sudah ada)
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jenis_output: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SLA: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      aktif: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("layanan");
  },
};
