/**
 * Migration: Add permissions support to roles table
 * Date: 2026-03-10
 * Purpose: Apply role permission patches from .dse/patches/role_permission_patch/
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add code column if not exists
    await queryInterface
      .addColumn("roles", "code", {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: "Role code identifier (e.g., kepala_dinas, sekretaris)",
      })
      .catch((err) => {
        if (err.message.includes("already exists")) {
          console.log("Column 'code' already exists, skipping");
        } else {
          throw err;
        }
      });

    // Add default_permissions column if not exists
    await queryInterface
      .addColumn("roles", "default_permissions", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Default permissions array for this role",
      })
      .catch((err) => {
        if (err.message.includes("already exists")) {
          console.log("Column 'default_permissions' already exists, skipping");
        } else {
          throw err;
        }
      });

    console.log("✅ Added permission columns to roles table");
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns in reverse order
    await queryInterface
      .removeColumn("roles", "default_permissions")
      .catch(() => {});
    await queryInterface.removeColumn("roles", "code").catch(() => {});
    console.log("✅ Removed permission columns from roles table");
  },
};
