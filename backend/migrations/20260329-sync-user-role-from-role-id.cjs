"use strict";

/**
 * Migration: Sync users.role column dari role_id FK
 *
 * Problem: kolom `role` di tabel users punya DEFAULT 'pelaksana'.
 * User yang dibuat via UI hanya punya role_id benar, tapi kolom role tertinggal
 * di 'pelaksana'. Ini menyebabkan login mengarah ke dashboard pelaksana.
 *
 * Fix: UPDATE users SET role = roles.code WHERE role_id IS NOT NULL AND roles.code != users.role
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Sync role column from roles table via role_id FK
    await queryInterface.sequelize.query(`
      UPDATE users
      SET role = r.code,
          updated_at = CURRENT_TIMESTAMP
      FROM roles r
      WHERE users.role_id = r.id
        AND r.code IS NOT NULL
        AND r.code != ''
        AND users.role != r.code
    `);

    console.log("[Migration] Synced users.role from role_id FK ✓");
  },

  async down(queryInterface, Sequelize) {
    // Tidak bisa di-revert secara aman — data lama sudah tidak diketahui
    console.log("[Migration] DOWN: tidak ada rollback untuk sync role");
  },
};
