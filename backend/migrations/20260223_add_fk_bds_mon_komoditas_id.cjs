// Migration: Tambahkan constraint foreign key pada BDS-MON

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambahkan constraint foreign key pada BDS-MON
    await queryInterface.addConstraint("bds_mon", {
      fields: ["komoditas_id"],
      type: "foreign key",
      name: "fk_bds_mon_komoditas_id",
      references: {
        table: "komoditas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("bds_mon", "fk_bds_mon_komoditas_id");
  },
};
