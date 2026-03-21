// Migration: Tambahkan kolom 'nama' pada tabel komoditas dan enforce foreign key pada BDS-CPD

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kolom 'nama' sudah ada, tidak perlu ditambah lagi
    // Tambahkan constraint foreign key pada BDS-CPD
    await queryInterface.addConstraint("bds_cpd", {
      fields: ["komoditas_id"],
      type: "foreign key",
      name: "fk_bds_cpd_komoditas_id",
      references: {
        table: "komoditas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Jangan hapus kolom 'nama' karena sudah ada sebelumnya
    await queryInterface.removeConstraint("bds_cpd", "fk_bds_cpd_komoditas_id");
  },
};
