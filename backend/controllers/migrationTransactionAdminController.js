import {
  listRegulasiVersi,
  listTransactionBatches,
  getTransactionBatchDetail,
  listUnmappedTransactions,
  getGovernanceReport,
  migrationTablesReady,
} from "../services/migrationTransactionAdminService.js";
import {
  previewTransactionUpdates,
  DEFAULT_TRANSACTION_TARGETS,
} from "../services/migrationTransactionApplyService.js";
import { HttpMigrationError, migrationSuccess } from "../utils/migrationResponse.js";

function parsePositiveInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseVersiPair(req) {
  const fromId = parsePositiveInt(
    req.query?.regulasi_versi_from_id ?? req.query?.from ?? req.body?.regulasi_versi_from_id,
  );
  const toId = parsePositiveInt(
    req.query?.regulasi_versi_to_id ?? req.query?.to ?? req.body?.regulasi_versi_to_id,
  );
  return { fromId, toId };
}

export async function getRegulasiVersiList(req, res) {
  const ready = await migrationTablesReady();
  if (!ready.ready) {
    throw new HttpMigrationError(
      503,
      "SCHEMA_NOT_READY",
      "Skema regulasi dinamis belum tersedia (jalankan migrasi backend).",
      { field: null, details: [] },
    );
  }
  const versi = await listRegulasiVersi();
  migrationSuccess(res, { versi }, "OK");
}

export async function getPreviewTransactionUpdates(req, res) {
  const { fromId, toId } = parseVersiPair(req);
  if (!fromId || !toId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Query regulasi_versi_from_id dan regulasi_versi_to_id wajib (bilangan positif).",
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

export async function getTransactionBatches(req, res) {
  const limit = Number(req.query?.limit);
  const offset = Number(req.query?.offset);
  const data = await listTransactionBatches({
    limit: Number.isFinite(limit) ? limit : undefined,
    offset: Number.isFinite(offset) ? offset : undefined,
  });
  migrationSuccess(res, data, "OK");
}

export async function getTransactionBatchDetailController(req, res) {
  const batchId = parsePositiveInt(req.query?.batchId ?? req.query?.batch_id);
  if (!batchId) {
    throw new HttpMigrationError(400, "VALIDATION_ERROR", "Query batchId wajib (bilangan positif).", {
      field: "batchId",
      details: [],
    });
  }
  try {
    const data = await getTransactionBatchDetail(batchId);
    migrationSuccess(res, data, "OK");
  } catch (e) {
    if (e?.statusCode === 404) {
      throw new HttpMigrationError(404, "BATCH_NOT_FOUND", e.message, { field: "batchId", details: [] });
    }
    throw e;
  }
}

export async function getUnmappedTransactions(req, res) {
  const { fromId, toId } = parseVersiPair(req);
  if (!fromId || !toId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Query regulasi_versi_from_id dan regulasi_versi_to_id wajib.",
      { field: !fromId ? "regulasi_versi_from_id" : "regulasi_versi_to_id", details: [] },
    );
  }
  if (fromId === toId) {
    throw new HttpMigrationError(400, "INVALID_VERSION_PAIR", "Versi asal dan tujuan harus berbeda", {
      field: "regulasi_versi_to_id",
      details: [],
    });
  }

  const data = await listUnmappedTransactions(fromId, toId);
  migrationSuccess(res, data, "OK");
}

export async function getGovernanceReportController(req, res) {
  const fromId = parsePositiveInt(req.query?.from ?? req.query?.regulasi_versi_from_id);
  const toId = parsePositiveInt(req.query?.to ?? req.query?.regulasi_versi_to_id);
  if (!fromId || !toId) {
    throw new HttpMigrationError(400, "VALIDATION_ERROR", "Query from & to (regulasi_versi id) wajib.", {
      field: !fromId ? "from" : "to",
      details: [],
    });
  }
  if (fromId === toId) {
    throw new HttpMigrationError(400, "INVALID_VERSION_PAIR", "Versi asal dan tujuan harus berbeda", {
      field: "to",
      details: [],
    });
  }

  const data = await getGovernanceReport(fromId, toId);
  migrationSuccess(res, data, "OK");
}
