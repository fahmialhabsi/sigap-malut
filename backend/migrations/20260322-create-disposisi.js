export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("disposisi", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    surat_masuk_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "surat_masuk", key: "id" },
      onDelete: "CASCADE",
    },
    dari_user_id: { type: Sequelize.INTEGER, allowNull: false },
    kepada_user_id: { type: Sequelize.INTEGER, allowNull: false },
    kepada_unit: { type: Sequelize.STRING(100), allowNull: true },
    instruksi: { type: Sequelize.TEXT, allowNull: false },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    batas_waktu: { type: Sequelize.DATEONLY, allowNull: true },
    prioritas: {
      type: Sequelize.ENUM("Rendah", "Normal", "Tinggi", "Urgent"),
      defaultValue: "Normal",
    },
    status: {
      type: Sequelize.ENUM("belum_dibaca", "dibaca", "proses", "selesai"),
      defaultValue: "belum_dibaca",
    },
    tanggal_disposisi: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    tanggal_selesai: { type: Sequelize.DATE, allowNull: true },
    hasil_tindak_lanjut: { type: Sequelize.TEXT, allowNull: true },
    file_balasan: { type: Sequelize.JSON, allowNull: true },
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
  await queryInterface.dropTable("disposisi");
};
