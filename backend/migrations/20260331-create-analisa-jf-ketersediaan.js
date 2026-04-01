// Prompt 12: Analisa JF Ketersediaan
// Catatan: gunakan STRING untuk ENUM agar aman di SQLite.
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("analisa_jf_ketersediaan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    jf_id: { type: Sequelize.INTEGER, allowNull: false },
    judul: { type: Sequelize.STRING(255), allowNull: false },
    jenis: { type: Sequelize.STRING(40), allowNull: false },
    isi_analisa: { type: Sequelize.TEXT, allowNull: false },
    periode: { type: Sequelize.STRING(20), allowNull: true },
    referensi_data: { type: Sequelize.JSON, allowNull: true },
    dokumen_url: { type: Sequelize.STRING(500), allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" },
    catatan_kabid: { type: Sequelize.TEXT, allowNull: true },
    diajukan_at: { type: Sequelize.DATE, allowNull: true },
    disetujui_at: { type: Sequelize.DATE, allowNull: true },
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

  await queryInterface.addIndex("analisa_jf_ketersediaan", ["jf_id", "periode"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("analisa_jf_ketersediaan");
};

