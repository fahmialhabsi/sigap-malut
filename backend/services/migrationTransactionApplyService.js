/**
 * Apply mapping_sub_kegiatan (status approved) ke baris transaksi yang memakai FK master_*.
 * Non-destructive: hanya UPDATE referensi; jejak disimpan untuk rollback.
 */

import { Op } from "sequelize";
import sequelize from "../config/database.js";
import MappingSubKegiatan from "../models/MappingSubKegiatan.js";
import MasterSubKegiatan from "../models/MasterSubKegiatan.js";
import MasterKegiatan from "../models/MasterKegiatan.js";
import MasterProgram from "../models/MasterProgram.js";
import MigrationTransactionApplyBatch from "../models/MigrationTransactionApplyBatch.js";
import MigrationTransactionApplyLog from "../models/MigrationTransactionApplyLog.js";
import Dpa from "../models/Dpa.js";
import Rka from "../models/Rka.js";
import Spj from "../models/Spj.js";
import { assertNoDuplicateApprovedMappings } from "./migrationTransactionGovernance.js";

/** Tabel transaksi yang punya kolom master_program_id / master_kegiatan_id / master_sub_kegiatan_id */
export const DEFAULT_TRANSACTION_TARGETS = [
  { key: "dpa", model: Dpa, tableName: "dpa" },
  { key: "rka", model: Rka, tableName: "rka" },
  { key: "spj", model: Spj, tableName: "spj" },
];

function logInfo(msg, meta = {}) {
  console.info("[migration-transaction-apply]", msg, meta);
}

async function resolveNewHierarchy(newSubId) {
  if (newSubId == null) return null;
  const sub = await MasterSubKegiatan.findByPk(newSubId);
  if (!sub) return null;
  const keg = await MasterKegiatan.findByPk(sub.master_kegiatan_id);
  if (!keg) return null;
  const prog = await MasterProgram.findByPk(keg.master_program_id);
  if (!prog) return null;
  return {
    master_program_id: prog.id,
    master_kegiatan_id: keg.id,
    master_sub_kegiatan_id: sub.id,
  };
}

/**
 * Ambil mapping approved unik per old_master_sub_kegiatan_id (paling baru menang).
 */
export async function loadApprovedMappingsByOldSub(regulasiVersiFromId, regulasiVersiToId) {
  const rows = await MappingSubKegiatan.findAll({
    where: {
      regulasi_versi_from_id: regulasiVersiFromId,
      regulasi_versi_to_id: regulasiVersiToId,
      status: "approved",
      new_master_sub_kegiatan_id: { [Op.ne]: null },
    },
    order: [["id", "DESC"]],
  });

  const map = new Map();
  for (const r of rows) {
    const plain = r.get({ plain: true });
    if (!map.has(plain.old_master_sub_kegiatan_id)) {
      map.set(plain.old_master_sub_kegiatan_id, plain);
    }
  }
  return map;
}

async function collectRowsForMapping(model, tableName, oldSubId) {
  const rows = await model.findAll({
    where: { master_sub_kegiatan_id: oldSubId },
    attributes: [
      "id",
      "master_program_id",
      "master_kegiatan_id",
      "master_sub_kegiatan_id",
    ],
    raw: true,
  });
  return rows.map((r) => ({ ...r, _table: tableName, _model: model }));
}

/**
 * Preview perubahan tanpa menulis DB (kecuali read).
 */
export async function previewTransactionUpdates({
  regulasiVersiFromId,
  regulasiVersiToId,
  targets = DEFAULT_TRANSACTION_TARGETS,
}) {
  await assertNoDuplicateApprovedMappings(regulasiVersiFromId, regulasiVersiToId);

  const mappingByOld = await loadApprovedMappingsByOldSub(regulasiVersiFromId, regulasiVersiToId);
  const mappings = [...mappingByOld.values()];

  const warnings = [];
  const changes = [];

  for (const m of mappings) {
    const newH = await resolveNewHierarchy(m.new_master_sub_kegiatan_id);
    if (!newH) {
      warnings.push({
        mapping_id: m.id,
        message: "Sub kegiatan baru tidak ditemukan; lewati mapping ini",
      });
      continue;
    }

    for (const t of targets) {
      let rows = [];
      try {
        rows = await collectRowsForMapping(t.model, t.tableName, m.old_master_sub_kegiatan_id);
      } catch (e) {
        warnings.push({
          table: t.tableName,
          message: String(e?.message || e),
        });
        continue;
      }

      for (const row of rows) {
        const already =
          row.master_sub_kegiatan_id === newH.master_sub_kegiatan_id &&
          row.master_kegiatan_id === newH.master_kegiatan_id &&
          row.master_program_id === newH.master_program_id;
        changes.push({
          table_name: t.tableName,
          row_id: row.id,
          mapping_sub_kegiatan_id: m.id,
          before: {
            master_program_id: row.master_program_id,
            master_kegiatan_id: row.master_kegiatan_id,
            master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          },
          after: newH,
          skip_reason: already ? "already_applied" : null,
        });
      }
    }
  }

  const summary = {
    approved_mappings: mappings.length,
    change_rows: changes.filter((c) => !c.skip_reason).length,
    skipped_already: changes.filter((c) => c.skip_reason === "already_applied").length,
    tables: {},
  };
  for (const c of changes) {
    if (c.skip_reason) continue;
    summary.tables[c.table_name] = (summary.tables[c.table_name] || 0) + 1;
  }

  return { changes, summary, warnings, mappings_used: mappings.length };
}

/**
 * Apply: satu DB transaction; tulis batch + log lalu UPDATE per baris.
 */
export async function applyMappingsToTransactions({
  regulasiVersiFromId,
  regulasiVersiToId,
  appliedByUserId = null,
  note = null,
  targets = DEFAULT_TRANSACTION_TARGETS,
  confirmApply = false,
  expectedChangeRows = undefined,
}) {
  const preview = await previewTransactionUpdates({
    regulasiVersiFromId,
    regulasiVersiToId,
    targets,
  });

  const toApply = preview.changes.filter((c) => !c.skip_reason);

  if (toApply.length > 0 && !confirmApply) {
    const err = new Error(
      "Apply ditolak: set confirm_apply=true setelah meninjau preview (safety governance).",
    );
    err.code = "CONFIRM_APPLY_REQUIRED";
    err.statusCode = 400;
    err.preview_summary = preview.summary;
    throw err;
  }

  if (
    expectedChangeRows !== undefined &&
    expectedChangeRows !== null &&
    Number(expectedChangeRows) !== toApply.length
  ) {
    const err = new Error(
      `Jumlah baris yang akan diubah (${toApply.length}) tidak sama dengan expected_change_rows (${expectedChangeRows}).`,
    );
    err.code = "EXPECTED_CHANGE_ROWS_MISMATCH";
    err.statusCode = 409;
    err.preview_summary = preview.summary;
    throw err;
  }

  if (toApply.length === 0) {
    logInfo("apply skipped — no rows to update", { preview: preview.summary });
    return {
      batch: null,
      applied: 0,
      preview_summary: preview.summary,
      warnings: preview.warnings,
    };
  }

  const modelByTable = Object.fromEntries(targets.map((t) => [t.tableName, t.model]));

  const result = await sequelize.transaction(async (transaction) => {
    const batch = await MigrationTransactionApplyBatch.create(
      {
        regulasi_versi_from_id: regulasiVersiFromId,
        regulasi_versi_to_id: regulasiVersiToId,
        applied_by_user_id: appliedByUserId,
        status: "applied",
        row_count: toApply.length,
        note,
      },
      { transaction },
    );

    let applied = 0;
    for (const c of toApply) {
      const Model = modelByTable[c.table_name];
      if (!Model) continue;

      await MigrationTransactionApplyLog.create(
        {
          batch_id: batch.id,
          table_name: c.table_name,
          row_pk: c.row_id,
          mapping_sub_kegiatan_id: c.mapping_sub_kegiatan_id,
          old_master_program_id: c.before.master_program_id,
          old_master_kegiatan_id: c.before.master_kegiatan_id,
          old_master_sub_kegiatan_id: c.before.master_sub_kegiatan_id,
          new_master_program_id: c.after.master_program_id,
          new_master_kegiatan_id: c.after.master_kegiatan_id,
          new_master_sub_kegiatan_id: c.after.master_sub_kegiatan_id,
        },
        { transaction },
      );

      await Model.update(
        {
          master_program_id: c.after.master_program_id,
          master_kegiatan_id: c.after.master_kegiatan_id,
          master_sub_kegiatan_id: c.after.master_sub_kegiatan_id,
        },
        { where: { id: c.row_id }, transaction },
      );
      applied += 1;
    }

    logInfo("apply committed", { batch_id: batch.id, applied });
    return { batch, applied };
  });

  return {
    batch: result.batch?.get({ plain: true }) ?? null,
    applied: result.applied,
    preview_summary: preview.summary,
    warnings: preview.warnings,
  };
}

/**
 * Rollback satu batch: kembalikan FK dari log (hanya entri belum di-rollback).
 */
export async function rollbackTransactionApplyBatch(batchId) {
  const batch = await MigrationTransactionApplyBatch.findByPk(batchId);
  if (!batch) {
    const err = new Error("Batch tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  if (batch.status === "rolled_back") {
    const err = new Error("Batch sudah di-rollback");
    err.statusCode = 400;
    throw err;
  }

  if (batch.status !== "applied") {
    const err = new Error(
      `Rollback hanya untuk batch berstatus applied (status saat ini: ${batch.status}).`,
    );
    err.statusCode = 400;
    throw err;
  }

  const logs = await MigrationTransactionApplyLog.findAll({
    where: { batch_id: batchId, rolled_back_at: null },
    order: [["id", "DESC"]],
  });

  if (logs.length === 0) {
    const err = new Error(
      "Tidak ada entri log yang dapat di-rollback untuk batch ini (mungkin sudah di-rollback semua).",
    );
    err.statusCode = 400;
    throw err;
  }

  const modelByTable = Object.fromEntries(DEFAULT_TRANSACTION_TARGETS.map((t) => [t.tableName, t.model]));

  await sequelize.transaction(async (transaction) => {
    for (const logRow of logs) {
      const Model = modelByTable[logRow.table_name];
      if (!Model) continue;
      await Model.update(
        {
          master_program_id: logRow.old_master_program_id,
          master_kegiatan_id: logRow.old_master_kegiatan_id,
          master_sub_kegiatan_id: logRow.old_master_sub_kegiatan_id,
        },
        { where: { id: logRow.row_pk }, transaction },
      );
      await logRow.update({ rolled_back_at: new Date() }, { transaction });
    }
    await batch.update({ status: "rolled_back" }, { transaction });
  });

  logInfo("rollback completed", { batch_id: batchId, entries: logs.length });
  return { batch_id: batchId, rolled_back_entries: logs.length };
}
