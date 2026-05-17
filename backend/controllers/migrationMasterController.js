import {
  listPrograms,
  listKegiatan,
  listSubKegiatan,
  listIndikator,
} from "../services/masterCascadeService.js";
import { runAutoMappingLite } from "../services/migrationAutoMappingLiteService.js";
import { HttpMigrationError, migrationSuccess } from "../utils/migrationResponse.js";

function parsePositiveInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function getMasterPrograms(req, res) {
  const regulasiVersiId = parsePositiveInt(req.query?.regulasi_versi_id);
  if (!regulasiVersiId) {
    throw new HttpMigrationError(400, "VALIDATION_ERROR", "Query regulasi_versi_id wajib (bilangan positif).", {
      field: "regulasi_versi_id",
      details: [],
    });
  }
  const datasetKey = req.query?.dataset_key ?? req.query?.datasetKey ?? null;
  const q = req.query?.q ?? req.query?.search ?? "";
  const items = await listPrograms({
    regulasiVersiId,
    datasetKey: datasetKey != null ? String(datasetKey) : null,
    q,
  });
  migrationSuccess(res, { items }, "OK");
}

export async function getMasterKegiatan(req, res) {
  const regulasiVersiId = parsePositiveInt(req.query?.regulasi_versi_id);
  const masterProgramId = parsePositiveInt(req.query?.master_program_id);
  if (!regulasiVersiId || !masterProgramId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Query regulasi_versi_id dan master_program_id wajib.",
      { field: !regulasiVersiId ? "regulasi_versi_id" : "master_program_id", details: [] },
    );
  }
  const q = req.query?.q ?? req.query?.search ?? "";
  const items = await listKegiatan({ regulasiVersiId, masterProgramId, q });
  migrationSuccess(res, { items }, "OK");
}

export async function getMasterSubKegiatan(req, res) {
  const regulasiVersiId = parsePositiveInt(req.query?.regulasi_versi_id);
  const masterKegiatanId = parsePositiveInt(req.query?.master_kegiatan_id);
  if (!regulasiVersiId || !masterKegiatanId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Query regulasi_versi_id dan master_kegiatan_id wajib.",
      { field: !regulasiVersiId ? "regulasi_versi_id" : "master_kegiatan_id", details: [] },
    );
  }
  const q = req.query?.q ?? req.query?.search ?? "";
  const items = await listSubKegiatan({ regulasiVersiId, masterKegiatanId, q });
  migrationSuccess(res, { items }, "OK");
}

export async function getMasterIndikator(req, res) {
  const regulasiVersiId = parsePositiveInt(req.query?.regulasi_versi_id);
  const masterSubKegiatanId = parsePositiveInt(req.query?.master_sub_kegiatan_id);
  if (!regulasiVersiId || !masterSubKegiatanId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Query regulasi_versi_id dan master_sub_kegiatan_id wajib.",
      { field: !regulasiVersiId ? "regulasi_versi_id" : "master_sub_kegiatan_id", details: [] },
    );
  }
  const datasetKey = req.query?.dataset_key ?? req.query?.datasetKey ?? null;
  const q = req.query?.q ?? req.query?.search ?? "";
  const items = await listIndikator({
    regulasiVersiId,
    masterSubKegiatanId,
    datasetKey: datasetKey != null ? String(datasetKey) : null,
    q,
  });
  migrationSuccess(res, { items }, "OK");
}

export async function postRunAutoMappingLite(req, res) {
  const fromId = parsePositiveInt(req.body?.regulasi_versi_from_id);
  const toId = parsePositiveInt(req.body?.regulasi_versi_to_id);
  if (!fromId || !toId) {
    throw new HttpMigrationError(
      400,
      "VALIDATION_ERROR",
      "Body regulasi_versi_from_id dan regulasi_versi_to_id wajib.",
      { field: !fromId ? "regulasi_versi_from_id" : "regulasi_versi_to_id", details: [] },
    );
  }
  const data = await runAutoMappingLite({
    regulasiVersiFromId: fromId,
    regulasiVersiToId: toId,
  });
  migrationSuccess(res, data, "Auto-mapping lite selesai");
}
