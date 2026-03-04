module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Convert uuid columns to text so audit_log can store integer IDs or UUIDs
    await queryInterface.sequelize.query(
      `ALTER TABLE audit_log ALTER COLUMN entitas_id TYPE text USING entitas_id::text;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE audit_log ALTER COLUMN pegawai_id TYPE text USING pegawai_id::text;`,
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Attempt to convert back to uuid; will fail if values are non-UUID.
    await queryInterface.sequelize.query(
      `ALTER TABLE audit_log ALTER COLUMN entitas_id TYPE uuid USING entitas_id::uuid;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE audit_log ALTER COLUMN pegawai_id TYPE uuid USING pegawai_id::uuid;`,
    );
  },
};
