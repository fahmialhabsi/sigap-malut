// Migration: Tambahkan kolom 'nama' pada tabel komoditas dan enforce foreign key pada BDS-CPD

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambahkan kolom 'nama' ke tabel komoditas
    await queryInterface.addColumn("komoditas", "nama", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "",
      comment: "Nama komoditas",
    });
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
    await queryInterface.removeColumn("komoditas", "nama");
    await queryInterface.removeConstraint("bds_cpd", "fk_bds_cpd_komoditas_id");
  },
};
