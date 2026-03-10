"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // No-op migration: previous migration already applied the schema changes.
    // We keep this so the migration will be recorded and won't fail.
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // No-op down.
    return Promise.resolve();
  },
};
