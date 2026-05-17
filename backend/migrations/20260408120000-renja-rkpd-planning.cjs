"use strict";

/** Renja ↔ RKPD: kolom dokumen perencanaan di renja, tabel rkpd + FK renja_id (idempotent). */

async function tableExists(qi, name) {
  const tables = await qi.showAllTables();
  return tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());
}

async function columnExists(qi, table, column) {
  try {
    const d = await qi.describeTable(table);
    return Boolean(d[column]);
  } catch {
    return false;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (await tableExists(queryInterface, "renja")) {
      const add = async (col, def) => {
        if (!(await columnExists(queryInterface, "renja", col))) {
          await queryInterface.addColumn("renja", col, def);
        }
      };
      await add("perangkat_daerah", { type: Sequelize.STRING(255), allowNull: true });
      await add("program", { type: Sequelize.STRING(512), allowNull: true });
      await add("kegiatan", { type: Sequelize.STRING(512), allowNull: true });
      await add("indikator", { type: Sequelize.STRING(512), allowNull: true });
      await add("target", { type: Sequelize.STRING(512), allowNull: true });
      await add("pagu", { type: Sequelize.DECIMAL(20, 2), allowNull: true });

      if (dialect === "postgres") {
        await queryInterface.sequelize.query(
          'ALTER TABLE renja DROP CONSTRAINT IF EXISTS "renja_tahun_key";',
        );
        await queryInterface.sequelize.query(
          'ALTER TABLE renja DROP CONSTRAINT IF EXISTS renja_tahun_key;',
        );
      }
    }

    if (!(await tableExists(queryInterface, "rkpd"))) {
      await queryInterface.createTable("rkpd", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        tahun: { type: Sequelize.INTEGER, allowNull: false },
        nama_sub_kegiatan: { type: Sequelize.STRING(512), allowNull: false },
        indikator: { type: Sequelize.STRING(512), allowNull: false },
        target: { type: Sequelize.STRING(512), allowNull: true },
        pagu: { type: Sequelize.DECIMAL(20, 2), allowNull: true },
        renja_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "renja", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        periode_rpjmd_id: { type: Sequelize.INTEGER, allowNull: true },
        status: { type: Sequelize.STRING(32), allowNull: false, defaultValue: "draft" },
        epelara_rkpd_id: { type: Sequelize.STRING(100), allowNull: true },
        sinkronisasi_status: {
          type: Sequelize.STRING(32),
          allowNull: false,
          defaultValue: "belum_sinkron",
        },
        sinkronisasi_terakhir: { type: Sequelize.DATE, allowNull: true },
        dibuat_oleh: { type: Sequelize.INTEGER, allowNull: true },
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
      await queryInterface.addIndex("rkpd", ["renja_id"], {
        name: "idx_rkpd_renja_id",
      });
      await queryInterface.addIndex("rkpd", ["tahun"], {
        name: "idx_rkpd_tahun",
      });
    } else {
      if (!(await columnExists(queryInterface, "rkpd", "renja_id"))) {
        await queryInterface.addColumn("rkpd", "renja_id", {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "renja", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        });
        await queryInterface.addIndex("rkpd", ["renja_id"], {
          name: "idx_rkpd_renja_id",
        });
      }
    }

    if (!(await tableExists(queryInterface, "rpjmd_periode"))) {
      await queryInterface.createTable("rpjmd_periode", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        nama: { type: Sequelize.STRING(255), allowNull: false },
        tahun_awal: { type: Sequelize.INTEGER, allowNull: false },
        tahun_akhir: { type: Sequelize.INTEGER, allowNull: false },
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
    }
  },

  async down() {
    // Sengaja dibiarkan kosong: penghapusan tabel rkpd/renja dapat merusak data produksi.
  },
};
