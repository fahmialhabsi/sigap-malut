/**
 * Admin: daftar batch, detail, unmapped transactions, daftar versi regulasi.
 */

import RegulasiVersi from "../models/RegulasiVersi.js";
import MappingSubKegiatan from "../models/MappingSubKegiatan.js";
import MasterSubKegiatan from "../models/MasterSubKegiatan.js";
import MasterKegiatan from "../models/MasterKegiatan.js";
import MasterProgram from "../models/MasterProgram.js";
import MigrationTransactionApplyBatch from "../models/MigrationTransactionApplyBatch.js";
import MigrationTransactionApplyLog from "../models/MigrationTransactionApplyLog.js";
import {
  previewTransactionUpdates,
  DEFAULT_TRANSACTION_TARGETS,
} from "./migrationTransactionApplyService.js";
import { findDuplicateApprovedMappings } from "./migrationTransactionGovernance.js";

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

export async function listRegulasiVersi() {
  const rows = await RegulasiVersi.findAll({
    order: [
      ["tahun", "DESC"],
      ["id", "DESC"],
    ],
    raw: true,
  });
  return rows;
}

export async function listTransactionBatches({ limit = 25, offset = 0 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);

  const { count, rows } = await MigrationTransactionApplyBatch.findAndCountAll({
    order: [["id", "DESC"]],
    limit: lim,
    offset: off,
    raw: true,
  });

  return {
    total: count,
    limit: lim,
    offset: off,
    batches: rows,
  };
}

export async function getTransactionBatchDetail(batchId) {
  const batch = await MigrationTransactionApplyBatch.findByPk(batchId, { raw: true });
  if (!batch) {
    const err = new Error("Batch tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  const logs = await MigrationTransactionApplyLog.findAll({
    where: { batch_id: batchId },
    order: [["id", "ASC"]],
    raw: true,
  });

  return { batch, logs, log_count: logs.length };
}

const REASON = {
  FK_SUB_KOSONG: "FK_SUB_KOSONG",
  SUB_MASTER_TIDAK_DITEMUKAN: "SUB_MASTER_TIDAK_DITEMUKAN",
  SUB_BUKAN_VERSI_ASAL: "SUB_BUKAN_VERSI_ASAL",
  MAPPING_MASIH_PENDING: "MAPPING_MASIH_PENDING",
  MAPPING_DITOLAK: "MAPPING_DITOLAK",
  MAPPING_BELUM_ADA: "MAPPING_BELUM_ADA",
  DUPLICATE_APPROVED_MAPPING_KONFLIK: "DUPLICATE_APPROVED_MAPPING_KONFLIK",
  TARGET_BARU_KOSONG: "TARGET_BARU_KOSONG",
  TARGET_HIERARKI_TIDAK_DITEMUKAN: "TARGET_HIERARKI_TIDAK_DITEMUKAN",
};

const REASON_LABEL = {
  [REASON.FK_SUB_KOSONG]: "master_sub_kegiatan_id kosong — tidak ada referensi sub untuk di-remap",
  [REASON.SUB_MASTER_TIDAK_DITEMUKAN]: "ID sub di transaksi tidak ditemukan di master_sub_kegiatan",
  [REASON.SUB_BUKAN_VERSI_ASAL]: "Sub bukan milik regulasi_versi_from — tidak cocok dengan jalur migrasi ini",
  [REASON.MAPPING_MASIH_PENDING]: "Ada mapping tapi status masih pending (belum approved)",
  [REASON.MAPPING_DITOLAK]: "Mapping ditolak — tidak ada jalur approved",
  [REASON.MAPPING_BELUM_ADA]: "Belum ada baris mapping untuk sub ini pada pasangan versi",
  [REASON.DUPLICATE_APPROVED_MAPPING_KONFLIK]: "Lebih dari satu mapping approved untuk sub lama yang sama (perbaiki data)",
  [REASON.TARGET_BARU_KOSONG]: "Mapping approved tetapi new_master_sub_kegiatan_id kosong",
  [REASON.TARGET_HIERARKI_TIDAK_DITEMUKAN]:
    "Target sub baru atau rantai program/kegiatan tidak ditemukan di master",
};

const REASON_GROUP_TARGET_TIDAK_ADA = new Set([
  REASON.TARGET_BARU_KOSONG,
  REASON.TARGET_HIERARKI_TIDAK_DITEMUKAN,
]);

function reasonGroupFor(code) {
  return REASON_GROUP_TARGET_TIDAK_ADA.has(code) ? "TARGET_TIDAK_ADA" : code;
}

/**
 * Transaksi yang tidak bisa dimigrasi untuk pasangan (from → to).
 */
export async function listUnmappedTransactions(regulasiVersiFromId, regulasiVersiToId) {
  const unmapped = [];
  const targets = DEFAULT_TRANSACTION_TARGETS;

  for (const t of targets) {
    let rows = [];
    try {
      rows = await t.model.findAll({
        attributes: ["id", "master_program_id", "master_kegiatan_id", "master_sub_kegiatan_id"],
        raw: true,
      });
    } catch {
      continue;
    }

    for (const row of rows) {
      if (row.master_sub_kegiatan_id == null) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: null,
          reason_code: REASON.FK_SUB_KOSONG,
          reason_label: REASON_LABEL[REASON.FK_SUB_KOSONG],
        });
        continue;
      }

      const sub = await MasterSubKegiatan.findByPk(row.master_sub_kegiatan_id, { raw: true });
      if (!sub) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: REASON.SUB_MASTER_TIDAK_DITEMUKAN,
          reason_label: REASON_LABEL[REASON.SUB_MASTER_TIDAK_DITEMUKAN],
        });
        continue;
      }

      if (sub.regulasi_versi_id === regulasiVersiToId) {
        // Sudah menunjuk master versi tujuan — tidak perlu dimigrasi lewat mapping ini
        continue;
      }

      if (sub.regulasi_versi_id !== regulasiVersiFromId) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: REASON.SUB_BUKAN_VERSI_ASAL,
          reason_label: REASON_LABEL[REASON.SUB_BUKAN_VERSI_ASAL],
        });
        continue;
      }

      const approvedList = await MappingSubKegiatan.findAll({
        where: {
          regulasi_versi_from_id: regulasiVersiFromId,
          regulasi_versi_to_id: regulasiVersiToId,
          old_master_sub_kegiatan_id: sub.id,
          status: "approved",
        },
        raw: true,
      });

      if (approvedList.length > 1) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: REASON.DUPLICATE_APPROVED_MAPPING_KONFLIK,
          reason_label: REASON_LABEL[REASON.DUPLICATE_APPROVED_MAPPING_KONFLIK],
          mapping_ids: approvedList.map((m) => m.id),
        });
        continue;
      }

      if (approvedList.length === 0) {
        const pending = await MappingSubKegiatan.findOne({
          where: {
            regulasi_versi_from_id: regulasiVersiFromId,
            regulasi_versi_to_id: regulasiVersiToId,
            old_master_sub_kegiatan_id: sub.id,
            status: "pending",
          },
        });
        const rejected = await MappingSubKegiatan.findOne({
          where: {
            regulasi_versi_from_id: regulasiVersiFromId,
            regulasi_versi_to_id: regulasiVersiToId,
            old_master_sub_kegiatan_id: sub.id,
            status: "rejected",
          },
        });
        let code = REASON.MAPPING_BELUM_ADA;
        let label = REASON_LABEL[REASON.MAPPING_BELUM_ADA];
        if (pending) {
          code = REASON.MAPPING_MASIH_PENDING;
          label = REASON_LABEL[REASON.MAPPING_MASIH_PENDING];
        } else if (rejected) {
          code = REASON.MAPPING_DITOLAK;
          label = REASON_LABEL[REASON.MAPPING_DITOLAK];
        }
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: code,
          reason_label: label,
        });
        continue;
      }

      const m = approvedList[0];
      if (m.new_master_sub_kegiatan_id == null) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: REASON.TARGET_BARU_KOSONG,
          reason_label: REASON_LABEL[REASON.TARGET_BARU_KOSONG],
          mapping_sub_kegiatan_id: m.id,
        });
        continue;
      }

      const newH = await resolveNewHierarchy(m.new_master_sub_kegiatan_id);
      if (!newH) {
        unmapped.push({
          table_name: t.tableName,
          row_id: row.id,
          master_sub_kegiatan_id: row.master_sub_kegiatan_id,
          reason_code: REASON.TARGET_HIERARKI_TIDAK_DITEMUKAN,
          reason_label: REASON_LABEL[REASON.TARGET_HIERARKI_TIDAK_DITEMUKAN],
          mapping_sub_kegiatan_id: m.id,
        });
        continue;
      }

      const already =
        row.master_sub_kegiatan_id === newH.master_sub_kegiatan_id &&
        row.master_kegiatan_id === newH.master_kegiatan_id &&
        row.master_program_id === newH.master_program_id;
      if (already) {
        continue;
      }
      // Bisa dimigrasi — tidak masuk daftar unmapped
    }
  }

  const summary = {
    counts_by_reason: {},
    counts_by_reason_group: {},
    by_table: {},
    reason_group_legend: {
      TARGET_TIDAK_ADA: [REASON.TARGET_BARU_KOSONG, REASON.TARGET_HIERARKI_TIDAK_DITEMUKAN],
    },
  };

  const unmappedWithGroup = unmapped.map((u) => {
    const reason_group = reasonGroupFor(u.reason_code);
    return { ...u, reason_group };
  });

  for (const u of unmappedWithGroup) {
    summary.counts_by_reason[u.reason_code] =
      (summary.counts_by_reason[u.reason_code] || 0) + 1;
    summary.counts_by_reason_group[u.reason_group] =
      (summary.counts_by_reason_group[u.reason_group] || 0) + 1;
    summary.by_table[u.table_name] = (summary.by_table[u.table_name] || 0) + 1;
  }

  return { unmapped: unmappedWithGroup, summary };
}

export async function getGovernanceReport(regulasiVersiFromId, regulasiVersiToId) {
  const duplicateRows = await findDuplicateApprovedMappings(regulasiVersiFromId, regulasiVersiToId);
  let preview_summary = null;
  if (duplicateRows.length === 0) {
    const preview = await previewTransactionUpdates({
      regulasiVersiFromId,
      regulasiVersiToId,
      targets: DEFAULT_TRANSACTION_TARGETS,
    });
    preview_summary = preview.summary;
  }
  const unmapped = await listUnmappedTransactions(regulasiVersiFromId, regulasiVersiToId);
  return {
    duplicate_approved_mappings: duplicateRows,
    preview_blocked_by_duplicates: duplicateRows.length > 0,
    preview_summary,
    unmapped_summary: unmapped.summary,
    unmapped_count: unmapped.unmapped.length,
  };
}

/** Health: apakah tabel regulasi ada */
export async function migrationTablesReady() {
  try {
    await RegulasiVersi.findOne({ limit: 1 });
    return { ready: true };
  } catch {
    return { ready: false };
  }
}
