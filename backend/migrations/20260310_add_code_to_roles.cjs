"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable("roles");
      if (tableDescription.code) {
        console.log('✓ Column "code" already exists in roles table');
        return;
      }

      // Add code column to roles table
      await queryInterface.addColumn("roles", "code", {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: "Role code identifier (e.g., kepala_dinas, sekretaris)",
      });

      console.log('✓ Added "code" column to roles table');
    } catch (error) {
      console.error("✗ Migration failed:", error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove code column from roles table
      await queryInterface.removeColumn("roles", "code");
      console.log('✓ Removed "code" column from roles table');
    } catch (error) {
      console.error("✗ Rollback failed:", error.message);
      throw error;
    }
  },
};
