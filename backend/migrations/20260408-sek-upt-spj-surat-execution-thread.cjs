/** Idempotent: menambah execution_thread_id + task_id untuk SEK/UPT/SPJ/surat jika belum ada. */
/** @param {import('sequelize').QueryInterface} queryInterface */
/** @param {import('sequelize').Sequelize} Sequelize */

const TABLES = require("../config/operationalThreadTables.json");

function isInsufficientTablePrivilege(err) {
  const code = err?.original?.code || err?.parent?.code;
  if (code === "42501") return true;
  const msg = String(err?.message || err?.original?.message || "").toLowerCase();
  return (
    msg.includes("must be owner") ||
    (msg.includes("permission denied") && msg.includes("table"))
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const uuidCol = {
      type: Sequelize.STRING(36),
      allowNull: true,
    };
    const taskCol = {
      type: Sequelize.INTEGER,
      allowNull: true,
    };

    const skippedNonOwner = new Set();

    function warnOwnerSkip(table) {
      console.warn(
        `[20260408-sek-upt-spj-surat-execution-thread] Lewati "${table}": bukan owner. ` +
          `ALTER TABLE "${table}" OWNER TO <user_migrasi>; lalu ADD COLUMN / CREATE INDEX seperti di 20260407.`,
      );
    }

    async function addColIfMissing(table, column, def) {
      if (skippedNonOwner.has(table)) return;
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc || desc[column]) return;
      try {
        await queryInterface.addColumn(table, column, def);
      } catch (e) {
        if (isInsufficientTablePrivilege(e)) {
          skippedNonOwner.add(table);
          warnOwnerSkip(table);
          return;
        }
        throw e;
      }
    }

    async function addIndexIfMissing(table, columns, opts) {
      if (skippedNonOwner.has(table)) return;
      try {
        await queryInterface.addIndex(table, columns, opts);
      } catch (e) {
        const msg = String(e?.message || "").toLowerCase();
        if (msg.includes("already exists")) return;
        if (isInsufficientTablePrivilege(e)) {
          skippedNonOwner.add(table);
          warnOwnerSkip(table);
          return;
        }
        throw e;
      }
    }

    const existing = new Set(
      (await queryInterface.showAllTables()).map((t) => String(t).toLowerCase()),
    );

    for (const { table } of TABLES) {
      if (!existing.has(String(table).toLowerCase())) continue;
      await addColIfMissing(table, "execution_thread_id", uuidCol);
      await addColIfMissing(table, "task_id", taskCol);
      await addIndexIfMissing(table, ["execution_thread_id"], {
        name: `idx_${table}_execution_thread_id`,
      });
    }
  },

  async down(queryInterface) {
    const existing = new Set(
      (await queryInterface.showAllTables()).map((t) => String(t).toLowerCase()),
    );
    const extra = new Set([
      "sek_adm",
      "sek_ast",
      "sek_hum",
      "sek_kbj",
      "sek_kep",
      "sek_keu",
      "sek_lds",
      "sek_lks",
      "sek_lkt",
      "sek_lup",
      "sek_ren",
      "sek_rmh",
      "upt_adm",
      "upt_ast",
      "upt_ins",
      "upt_kep",
      "upt_keu",
      "upt_mtu",
      "upt_tkn",
      "spj",
      "surat_masuk",
      "surat_keluar",
    ]);
    for (const { table } of TABLES) {
      if (!extra.has(String(table).toLowerCase())) continue;
      if (!existing.has(String(table).toLowerCase())) continue;
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (desc?.task_id) {
        await queryInterface.removeColumn(table, "task_id").catch(() => {});
      }
      if (desc?.execution_thread_id) {
        await queryInterface.removeColumn(table, "execution_thread_id").catch(() => {});
      }
    }
  },
};
