"use strict";

const TABLE_NAME = "pelatihan_pengolahan_pangan_lokal";
const ENUM_PESERTA_STATUS = `enum_${TABLE_NAME}_peserta_status`;
const ENUM_IS_SENSITIVE = `enum_${TABLE_NAME}_is_sensitive`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // peserta_status
    await queryInterface.addColumn(TABLE_NAME, "peserta_status", {
      type: Sequelize.ENUM("registered", "attended", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "registered",
    });

    // biaya
    await queryInterface.addColumn(TABLE_NAME, "biaya", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
    });

    // is_sensitive
    await queryInterface.addColumn(TABLE_NAME, "is_sensitive", {
      type: Sequelize.ENUM("Biasa", "Sensitif"),
      allowNull: false,
      defaultValue: "Biasa",
    });

    // created_by FK
    await queryInterface.addColumn(TABLE_NAME, "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint(TABLE_NAME, {
      fields: ["created_by"],
      type: "foreign key",
      name: `${TABLE_NAME}_created_by_fkey`,
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint(
        TABLE_NAME,
        `${TABLE_NAME}_created_by_fkey`,
      );
    } catch (e) {}

    await queryInterface.removeColumn(TABLE_NAME, "created_by");
    await queryInterface.removeColumn(TABLE_NAME, "is_sensitive");
    await queryInterface.removeColumn(TABLE_NAME, "biaya");
    await queryInterface.removeColumn(TABLE_NAME, "peserta_status");

    if (
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === "postgres"
    ) {
      await queryInterface.sequelize.query(
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${ENUM_PESERTA_STATUS}') THEN DROP TYPE "enum_${TABLE_NAME}_peserta_status"; END IF; END$$;`,
      );
      await queryInterface.sequelize.query(
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${ENUM_IS_SENSITIVE}') THEN DROP TYPE "enum_${TABLE_NAME}_is_sensitive"; END IF; END$$;`,
      );
    }
  },
};
