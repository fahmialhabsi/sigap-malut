"use strict";

/** Kolom FK master_* pada tabel transaksi (nullable — data lama tetap valid). */

async function safeAdd(qi, table, col, def) {
  const desc = await qi.describeTable(table).catch(() => null);
  if (!desc || desc[col]) return;
  await qi.addColumn(table, col, def);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (n) => tables.map((t) => String(t).toLowerCase()).includes(n.toLowerCase());

    const fkProgram = {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "master_program", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    };
    const fkKegiatan = {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "master_kegiatan", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    };
    const fkSub = {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "master_sub_kegiatan", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    };

    for (const T of ["dpa", "rka", "spj"]) {
      if (!has(T)) continue;
      await safeAdd(queryInterface, T, "master_program_id", fkProgram);
      await safeAdd(queryInterface, T, "master_kegiatan_id", fkKegiatan);
      await safeAdd(queryInterface, T, "master_sub_kegiatan_id", fkSub);
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const has = (n) => tables.map((t) => String(t).toLowerCase()).includes(n.toLowerCase());

    for (const T of ["dpa", "rka", "spj"]) {
      if (!has(T)) continue;
      const desc = await queryInterface.describeTable(T).catch(() => null);
      if (!desc) continue;
      for (const col of ["master_sub_kegiatan_id", "master_kegiatan_id", "master_program_id"]) {
        if (desc[col]) {
          await queryInterface.removeColumn(T, col);
        }
      }
    }
  },
};
