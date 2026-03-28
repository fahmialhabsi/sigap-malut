"use strict";

/**
 * Migration: create user_hierarchy table
 * Purpose: Track subordinate relationships between users for JF Adaptif dashboard logic.
 *   - JF with has_subordinate=true → shown as JF Bidang (ADMINISTRATOR on e-Pelara)
 *   - JF with has_subordinate=false → shown as JF Sekretariat/UPTD (PENGAWAS on e-Pelara)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_hierarchy", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      supervisor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "ID of direct supervisor (kepala_bidang / kepala_uptd)",
      },
      has_subordinate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "true = user has subordinates (JF Bidang); false = JF Sekretariat/UPTD",
      },
      unit_kerja: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
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

    await queryInterface.addIndex("user_hierarchy", ["user_id"], {
      unique: true,
      name: "user_hierarchy_user_id_unique",
    });
    await queryInterface.addIndex("user_hierarchy", ["supervisor_id"], {
      name: "user_hierarchy_supervisor_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_hierarchy");
  },
};
