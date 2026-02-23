// Migration: Tambahkan kolom 'nama' pada tabel komoditas dan enforce foreign key pada BDS-HRG

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kolom 'nama' sudah ada, tidak perlu ditambah lagi
    // await queryInterface.addColumn("komoditas", "nama", { ... });
    // Tambahkan constraint foreign key pada BDS-HRG
    await queryInterface.addConstraint("bds_hrg", {
      fields: ["komoditas_id"],
      type: "foreign key",
      name: "fk_bds_hrg_komoditas_id",
      references: {
        table: "komoditas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Jangan hapus kolom 'nama'
    await queryInterface.removeConstraint("bds_hrg", "fk_bds_hrg_komoditas_id");
  },
};
