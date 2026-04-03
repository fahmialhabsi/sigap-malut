#!/usr/bin/env node
/**
 * Backfill execution_thread_id untuk surat_masuk & spj (baris NULL).
 * Prioritas: salin dari Tasks lewat task_id jika ada; jika tidak, UUID baru (audit: pola standalone).
 *
 * Env:
 *   BACKFILL_DRY_RUN=1 — hanya cetak rencana, tidak UPDATE
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import SuratMasuk from "../models/SuratMasuk.js";
import Spj from "../models/Spj.js";
import Task from "../models/Task.js";

const dry = process.env.BACKFILL_DRY_RUN === "1";

async function resolveThreadIdFromTask(taskId) {
  if (taskId == null) return null;
  const t = await Task.findByPk(taskId, { attributes: ["id", "execution_thread_id"] });
  const tid = t?.getDataValue?.("execution_thread_id") ?? t?.execution_thread_id;
  return tid && String(tid).trim() ? String(tid).trim() : null;
}

async function backfillSuratMasuk(log) {
  const rows = await SuratMasuk.findAll({
    where: { execution_thread_id: { [Op.is]: null } },
    attributes: ["id", "task_id", "nomor_agenda"],
  });
  let ok = 0;
  let fail = 0;
  for (const r of rows) {
    const id = r.getDataValue("id");
    let next = await resolveThreadIdFromTask(r.getDataValue("task_id"));
    let source = "task";
    if (!next) {
      next = randomUUID();
      source = "new_uuid_standalone";
    }
    try {
      if (!dry) {
        await SuratMasuk.update(
          { execution_thread_id: next },
          { where: { id } },
        );
      }
      log.push({
        table: "surat_masuk",
        id,
        nomor_agenda: r.getDataValue("nomor_agenda"),
        execution_thread_id: next,
        source,
      });
      ok += 1;
    } catch (e) {
      fail += 1;
      log.push({
        table: "surat_masuk",
        id,
        error: String(e?.message || e),
      });
    }
  }
  return { found: rows.length, updated: ok, failed: fail };
}

async function backfillSpj(log) {
  const rows = await Spj.findAll({
    where: { execution_thread_id: { [Op.is]: null } },
    attributes: ["id", "task_id", "nomor_spj"],
  });
  let ok = 0;
  let fail = 0;
  for (const r of rows) {
    const id = r.getDataValue("id");
    let next = await resolveThreadIdFromTask(r.getDataValue("task_id"));
    let source = "task";
    if (!next) {
      next = randomUUID();
      source = "new_uuid_standalone";
    }
    try {
      if (!dry) {
        await Spj.update({ execution_thread_id: next }, { where: { id } });
      }
      log.push({
        table: "spj",
        id,
        nomor_spj: r.getDataValue("nomor_spj"),
        execution_thread_id: next,
        source,
      });
      ok += 1;
    } catch (e) {
      fail += 1;
      log.push({ table: "spj", id, error: String(e?.message || e) });
    }
  }
  return { found: rows.length, updated: ok, failed: fail };
}

async function main() {
  if (sequelize.getDialect() !== "postgres") {
    console.log(
      JSON.stringify(
        { ok: false, reason: "Backfill ini untuk PostgreSQL; dialect saat ini tidak didukung." },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const changes = [];
  const sm = await backfillSuratMasuk(changes);
  const sp = await backfillSpj(changes);

  const out = {
    ok: sm.failed + sp.failed === 0,
    dry_run: dry,
    surat_masuk: sm,
    spj: sp,
    changes,
  };

  console.log(JSON.stringify(out, null, 2));

  try {
    await sequelize.close();
  } catch {
    /* ignore */
  }
  process.exit(out.ok ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  try {
    await sequelize.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
