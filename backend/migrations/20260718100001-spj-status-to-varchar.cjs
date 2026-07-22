"use strict";

/**
 * spj.status adalah ENUM lama (draft/submitted/verified/rejected) — tidak mencakup
 * status alur mandiri/delegasi yang dipakai kode saat ini (diajukan_ke_bendahara,
 * terverifikasi_bendahara, diajukan_ke_ppk, terverifikasi_ppk, dst). Validasi status
 * sudah dilakukan di layer controller, jadi kolom diubah ke VARCHAR agar tidak
 * membatasi nilai di level DB.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" DROP DEFAULT;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" TYPE VARCHAR(30) USING "status"::text;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" SET DEFAULT 'draft';`,
    );
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_spj_status";`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_spj_status" AS ENUM ('draft', 'submitted', 'verified', 'rejected');`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" DROP DEFAULT;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" TYPE "enum_spj_status" USING "status"::"enum_spj_status";`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "spj" ALTER COLUMN "status" SET DEFAULT 'draft';`,
    );
  },
};
