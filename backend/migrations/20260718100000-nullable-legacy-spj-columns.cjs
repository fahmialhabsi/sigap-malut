"use strict";

/**
 * Kolom legacy tabel spj (judul, kegiatan, pelaksana_id) peninggalan skema SPJ lama,
 * sudah digantikan uraian_kegiatan/sub_kegiatan_kode/dibuat_oleh — tapi masih NOT NULL
 * tanpa default sehingga memblokir Spj.create() lewat model saat ini. Jadikan nullable.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("spj", "judul", {
      type: Sequelize.STRING(300),
      allowNull: true,
    });
    await queryInterface.changeColumn("spj", "kegiatan", {
      type: Sequelize.STRING(300),
      allowNull: true,
    });
    await queryInterface.changeColumn("spj", "pelaksana_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("spj", "judul", {
      type: Sequelize.STRING(300),
      allowNull: false,
    });
    await queryInterface.changeColumn("spj", "kegiatan", {
      type: Sequelize.STRING(300),
      allowNull: false,
    });
    await queryInterface.changeColumn("spj", "pelaksana_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
