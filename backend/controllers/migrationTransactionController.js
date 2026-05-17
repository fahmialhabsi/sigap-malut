import {
  previewTransactionUpdates,
  applyMappingsToTransactions,
  rollbackTransactionApplyBatch,
  DEFAULT_TRANSACTION_TARGETS,
} from "../services/migrationTransactionApplyService.js";
import { HttpMigrationError, migrationSuccess } from "../utils/migrationResponse.js";

function parsePositiveInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function previewTransactionUpdatesController(req, res) {
  const fromId = parsePositiveInt(req.body?.regulasi_versi_from_id);
  const toId = parsePositiveInt(req.body?.regulasi_versi_to_id);
  if (!fromId || !toId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "regulasi_versi_from_id dan regulasi_versi_to_id wajib berupa bilangan positif",
      { field: !fromId ? "regulasi_versi_from_id" : "regulasi_versi_to_id", details: [] },
    );
  }
  if (fromId === toId) {
    throw new HttpMigrationError(400, "INVALID_VERSION_PAIR", "Versi asal dan tujuan harus berbeda", {
      field: "regulasi_versi_to_id",
      details: [],
    });
  }

  try {
    const data = await previewTransactionUpdates({
      regulasiVersiFromId: fromId,
      regulasiVersiToId: toId,
      targets: DEFAULT_TRANSACTION_TARGETS,
    });
    migrationSuccess(res, data, "Preview siap");
  } catch (e) {
    if (e?.code === "DUPLICATE_APPROVED_MAPPING") {
      throw new HttpMigrationError(422, e.code, e.message, {
        field: "mapping_sub_kegiatan",
        details: e.duplicates || [],
      });
    }
    throw e;
  }
}

export async function applyToTransactionsController(req, res) {
  const fromId = parsePositiveInt(req.body?.regulasi_versi_from_id);
  const toId = parsePositiveInt(req.body?.regulasi_versi_to_id);
  if (!fromId || !toId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "regulasi_versi_from_id dan regulasi_versi_to_id wajib berupa bilangan positif",
      { field: !fromId ? "regulasi_versi_from_id" : "regulasi_versi_to_id", details: [] },
    );
  }
  if (fromId === toId) {
    throw new HttpMigrationError(400, "INVALID_VERSION_PAIR", "Versi asal dan tujuan harus berbeda", {
      field: "regulasi_versi_to_id",
      details: [],
    });
  }

  try {
    const data = await applyMappingsToTransactions({
      regulasiVersiFromId: fromId,
      regulasiVersiToId: toId,
      appliedByUserId: req.user?.id ?? null,
      note: req.body?.note ?? null,
      targets: DEFAULT_TRANSACTION_TARGETS,
      confirmApply: Boolean(req.body?.confirm_apply),
      expectedChangeRows:
        req.body?.expected_change_rows === undefined || req.body?.expected_change_rows === null
          ? undefined
          : Number(req.body.expected_change_rows),
    });
    migrationSuccess(res, data, "Apply selesai");
  } catch (e) {
    if (e?.code === "CONFIRM_APPLY_REQUIRED") {
      throw new HttpMigrationError(400, e.code, e.message, {
        field: "confirm_apply",
        details: e.preview_summary ? [{ summary: e.preview_summary }] : [],
      });
    }
    if (e?.code === "EXPECTED_CHANGE_ROWS_MISMATCH") {
      throw new HttpMigrationError(409, e.code, e.message, {
        field: "expected_change_rows",
        details: e.preview_summary ? [{ summary: e.preview_summary }] : [],
      });
    }
    if (e?.code === "DUPLICATE_APPROVED_MAPPING") {
      throw new HttpMigrationError(422, e.code, e.message, {
        field: "mapping_sub_kegiatan",
        details: e.duplicates || [],
      });
    }
    throw e;
  }
}

export async function rollbackTransactionApplyController(req, res) {
  const batchId = parsePositiveInt(req.body?.batch_id);
  if (!batchId) {
    throw new HttpMigrationError(400, "VALIDATION_ERROR", "batch_id wajib berupa bilangan positif", {
      field: "batch_id",
      details: [],
    });
  }

  try {
    const data = await rollbackTransactionApplyBatch(batchId);
    migrationSuccess(res, data, "Rollback selesai");
  } catch (e) {
    const sc = e?.statusCode || 500;
    if (sc === 404) {
      throw new HttpMigrationError(404, "BATCH_NOT_FOUND", e.message, { field: "batch_id", details: [] });
    }
    if (sc === 400) {
      throw new HttpMigrationError(400, "ROLLBACK_NOT_ALLOWED", e.message, { field: "batch_id", details: [] });
    }
    throw e;
  }
}
