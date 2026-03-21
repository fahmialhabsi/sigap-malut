"use strict";

const TABLE_NAME = "pengelolaan_data_kepegawaian";
const ENUM_IS_SENSITIVE = `enum_${TABLE_NAME}_is_sensitive`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // email
    await queryInterface.addColumn(TABLE_NAME, "email", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // phone
    await queryInterface.addColumn(TABLE_NAME, "phone", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    // alamat_ktp
    await queryInterface.addColumn(TABLE_NAME, "alamat_ktp", {
      type: Sequelize.TEXT,
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
    await queryInterface.removeColumn(TABLE_NAME, "alamat_ktp");
    await queryInterface.removeColumn(TABLE_NAME, "phone");
    await queryInterface.removeColumn(TABLE_NAME, "email");

    if (
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === "postgres"
    ) {
      await queryInterface.sequelize.query(
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${ENUM_IS_SENSITIVE}') THEN DROP TYPE "${ENUM_IS_SENSITIVE}"; END IF; END$$;`,
      );
    }
  },
};
