/** @param {import('sequelize').QueryInterface} queryInterface */
/** @param {import('sequelize').Sequelize} Sequelize */

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    const uuidCol = {
      type: Sequelize.STRING(36),
      allowNull: true,
    };

    async function addColIfMissing(table, column, def) {
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc || desc[column]) return;
      await queryInterface.addColumn(table, column, def);
    }

    async function addIndexIfMissing(table, columns, opts) {
      try {
        await queryInterface.addIndex(table, columns, opts);
      } catch (e) {
        if (!String(e?.message || "").toLowerCase().includes("already exists")) {
          throw e;
        }
      }
    }

    await addColIfMissing("instruksi_gubernur", "execution_thread_id", uuidCol);
    await addColIfMissing("Tasks", "execution_thread_id", uuidCol);
    await addColIfMissing("pengajuan_ke_gubernur", "execution_thread_id", uuidCol);
    await addColIfMissing("clarification_threads", "execution_thread_id", uuidCol);

    await addIndexIfMissing("instruksi_gubernur", ["execution_thread_id"], {
      name: "idx_instruksi_gubernur_execution_thread_id",
    });
    await addIndexIfMissing("Tasks", ["execution_thread_id"], {
      name: "idx_tasks_execution_thread_id",
    });
    await addIndexIfMissing("pengajuan_ke_gubernur", ["execution_thread_id"], {
      name: "idx_pengajuan_ke_gubernur_execution_thread_id",
    });

    const tables = await queryInterface.showAllTables();
    const hasEvents = tables.some(
      (t) => String(t).toLowerCase() === "execution_thread_events",
    );
    if (!hasEvents) {
      await queryInterface.createTable("execution_thread_events", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      execution_thread_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      ref_modul: { type: Sequelize.STRING(100), allowNull: true },
      ref_id: { type: Sequelize.STRING(100), allowNull: true },
      payload: { type: Sequelize.JSON, allowNull: true },
      actor_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    }
    await addIndexIfMissing("execution_thread_events", ["execution_thread_id"], {
      name: "idx_execution_thread_events_thread",
    });

    const [instrRows] = await queryInterface.sequelize.query(
      "SELECT id FROM instruksi_gubernur WHERE execution_thread_id IS NULL",
    );
    for (const row of instrRows || []) {
      const u = randomUUID();
      await queryInterface.sequelize.query(
        `UPDATE instruksi_gubernur SET execution_thread_id = :u WHERE id = :id`,
        { replacements: { u, id: row.id } },
      );
    }

    const [taskRows] = await queryInterface.sequelize.query(
      'SELECT id, metadata, sumber_perintah_kadin FROM "Tasks" WHERE execution_thread_id IS NULL',
    );
    const threadByInstrId = new Map();
    const [ij] = await queryInterface.sequelize.query(
      "SELECT id, execution_thread_id FROM instruksi_gubernur",
    );
    for (const r of ij || []) {
      threadByInstrId.set(Number(r.id), r.execution_thread_id);
    }

    const taskById = new Map((taskRows || []).map((t) => [t.id, t]));

    function resolveThreadForTask(t) {
      const meta = t.metadata || {};
      const sid = meta.sumber_instruksi_gubernur_id;
      if (sid != null && threadByInstrId.has(Number(sid))) {
        return threadByInstrId.get(Number(sid));
      }
      let cur = t;
      const seen = new Set();
      while (cur && cur.sumber_perintah_kadin && !seen.has(cur.id)) {
        seen.add(cur.id);
        cur = taskById.get(cur.sumber_perintah_kadin);
        if (!cur) break;
        if (cur.execution_thread_id) return cur.execution_thread_id;
        const m = cur.metadata || {};
        const s2 = m.sumber_instruksi_gubernur_id;
        if (s2 != null && threadByInstrId.has(Number(s2))) {
          return threadByInstrId.get(Number(s2));
        }
      }
      return randomUUID();
    }

    for (const t of taskRows || []) {
      const u = resolveThreadForTask(t);
      await queryInterface.sequelize.query(
        `UPDATE "Tasks" SET execution_thread_id = :u WHERE id = :id`,
        { replacements: { u, id: t.id } },
      );
    }

    const [pRows] = await queryInterface.sequelize.query(
      "SELECT id, instruksi_id FROM pengajuan_ke_gubernur WHERE execution_thread_id IS NULL",
    );
    for (const p of pRows || []) {
      let u = randomUUID();
      if (p.instruksi_id != null && threadByInstrId.has(Number(p.instruksi_id))) {
        u = threadByInstrId.get(Number(p.instruksi_id));
      }
      await queryInterface.sequelize.query(
        `UPDATE pengajuan_ke_gubernur SET execution_thread_id = :u WHERE id = :id`,
        { replacements: { u, id: p.id } },
      );
    }

    const [cRows] = await queryInterface.sequelize.query(
      "SELECT id, anchor_type, anchor_id FROM clarification_threads WHERE execution_thread_id IS NULL",
    );
    for (const c of cRows || []) {
      let u = randomUUID();
      const at = String(c.anchor_type || "");
      const aid = Number(c.anchor_id);
      if (at === "instruksi_gubernur" && threadByInstrId.has(aid)) {
        u = threadByInstrId.get(aid);
      } else if (at === "task") {
        const [tr] = await queryInterface.sequelize.query(
          `SELECT execution_thread_id FROM "Tasks" WHERE id = :id LIMIT 1`,
          { replacements: { id: aid } },
        );
        if (tr && tr[0] && tr[0].execution_thread_id) {
          u = tr[0].execution_thread_id;
        }
      }
      await queryInterface.sequelize.query(
        `UPDATE clarification_threads SET execution_thread_id = :u WHERE id = :id`,
        { replacements: { u, id: c.id } },
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "execution_thread_events",
      "idx_execution_thread_events_thread",
    );
    await queryInterface.dropTable("execution_thread_events");
    await queryInterface.removeIndex(
      "pengajuan_ke_gubernur",
      "idx_pengajuan_ke_gubernur_execution_thread_id",
    );
    await queryInterface.removeIndex("Tasks", "idx_tasks_execution_thread_id");
    await queryInterface.removeIndex(
      "instruksi_gubernur",
      "idx_instruksi_gubernur_execution_thread_id",
    );
    await queryInterface.removeColumn("clarification_threads", "execution_thread_id");
    await queryInterface.removeColumn("pengajuan_ke_gubernur", "execution_thread_id");
    await queryInterface.removeColumn("Tasks", "execution_thread_id");
    await queryInterface.removeColumn("instruksi_gubernur", "execution_thread_id");
  },
};
