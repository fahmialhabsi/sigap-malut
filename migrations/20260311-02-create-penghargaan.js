export const up = async (queryInterface, Sequelize) => {
  const dialect =
    typeof queryInterface.sequelize.getDialect === "function"
      ? queryInterface.sequelize.getDialect()
      : null;

  // helper: check table exists for sqlite/postgres
  async function tableExists(tableName) {
    if (dialect === "sqlite" || dialect === "mssql") {
      const res = await queryInterface.sequelize.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
      );
      return Array.isArray(res) && res[0] && res[0].length > 0;
    } else if (dialect === "postgres") {
      const res = await queryInterface.sequelize.query(
        `SELECT to_regclass('${tableName}')`,
      );
      return (
        Array.isArray(res) &&
        res[0] &&
        res[0][0] &&
        res[0][0].to_regclass !== null
      );
    } else {
      // fallback: try createTable and catch if exists (but we prefer an explicit check)
      try {
        const res = await queryInterface.sequelize.query(
          `SELECT 1 FROM ${tableName} LIMIT 1;`,
        );
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  if (await tableExists("penghargaan")) {
    return;
  }

  // Build columns with dialect-specific differences
  const columns = {
    id:
      dialect === "postgres"
        ? {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal("gen_random_uuid()"),
          }
        : {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
    asn_id: { type: Sequelize.INTEGER, allowNull: true },
    nip: { type: Sequelize.STRING(18), allowNull: true },
    nama_asn: { type: Sequelize.STRING(255), allowNull: true },
    jenis_penghargaan: { type: Sequelize.STRING(255), allowNull: true },
    tanggal_penghargaan: { type: Sequelize.DATEONLY, allowNull: true },
    nomor_sk: { type: Sequelize.STRING(255), allowNull: true },
    penanggung_jawab: { type: Sequelize.STRING(255), allowNull: true },
    keterangan: { type: Sequelize.TEXT, allowNull: true },
    // is_sensitive: ENUM on Postgres, string (with default) on sqlite
    is_sensitive:
      dialect === "postgres"
        ? {
            type: Sequelize.ENUM("Biasa", "Sensitif"),
            allowNull: false,
            defaultValue: "Biasa",
          }
        : {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: "Biasa",
          },
    created_by: { type: Sequelize.INTEGER, allowNull: true },
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
  };

  await queryInterface.createTable("penghargaan", columns);

  // FK: created_by -> users.id (only if users table exists)
  try {
    if (await tableExists("users")) {
      await queryInterface.addConstraint("penghargaan", {
        fields: ["created_by"],
        type: "foreign key",
        name: "penghargaan_created_by_fkey",
        references: { table: "users", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  } catch (e) {
    // ignore FK addition failure
  }

  // Optional FK asn_id -> asns.id (if asns table exists)
  try {
    if (await tableExists("asns")) {
      await queryInterface.addConstraint("penghargaan", {
        fields: ["asn_id"],
        type: "foreign key",
        name: "penghargaan_asn_id_fkey",
        references: { table: "asns", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  } catch (e) {
    // ignore if asns table has different PK type or not present
  }
};

export const down = async (queryInterface) => {
  // remove constraints if exist
  try {
    await queryInterface.removeConstraint(
      "penghargaan",
      "penghargaan_created_by_fkey",
    );
  } catch (e) {}
  try {
    await queryInterface.removeConstraint(
      "penghargaan",
      "penghargaan_asn_id_fkey",
    );
  } catch (e) {}

  await queryInterface.dropTable("penghargaan").catch(() => {});

  // cleanup enum types on Postgres
  const dialect =
    typeof queryInterface.sequelize.getDialect === "function"
      ? queryInterface.sequelize.getDialect()
      : null;

  if (dialect === "postgres") {
    // drop enum type if exists
    await queryInterface.sequelize.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_penghargaan_is_sensitive') THEN DROP TYPE "enum_penghargaan_is_sensitive"; END IF; END$$;`,
    );
  }
};
