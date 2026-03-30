import { randomUUID } from "crypto";
import {
  insertHargaPanganRows,
  resolveKomoditasId,
  getReferencePricePreviousDay,
  verifyBatch as repoVerifyBatch,
  returnBatchToPelaksana as repoReturnBatch,
  findHargaPanganByPk,
  HARGA_PANGAN_STATUS,
} from "./hargaPanganRepository.js";
import {
  validateHargaBarisHard,
  validateHargaBarisSoft,
} from "./hargaPanganValidationService.js";
import { logHargaPanganEntry } from "./auditLogService.js";

export function tanggalSehariSebelumnya(tanggalStr) {
  const [y, m, d] = tanggalStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/**
 * Submit batch dari pelaksana: validasi keras + lunak, audit CREATE.
 */
export async function submitHargaPanganBatch(payload, actor) {
  const {
    tanggal,
    pasar_id,
    pasar_nama,
    kabupaten_kota,
    sumber_data,
    baris,
    status,
    diinput_oleh,
  } = payload;

  if (!tanggal || !Array.isArray(baris) || baris.length === 0) {
    return { ok: false, error: "tanggal_dan_baris_wajib" };
  }

  const hardErrors = [];
  for (let i = 0; i < baris.length; i++) {
    const b = baris[i];
    const errs = validateHargaBarisHard({
      harga_eceran: b.harga_eceran,
      komoditas_key: b.komoditas_key,
    });
    errs.forEach((e) => hardErrors.push({ index: i, ...e }));
  }
  if (hardErrors.length) return { ok: false, hardErrors };

  const tanggalKemarin = tanggalSehariSebelumnya(tanggal);
  const submit = status === "submitted_to_jf";
  const rowStatus = submit ? HARGA_PANGAN_STATUS.MENUNGGU : HARGA_PANGAN_STATUS.DRAFT;

  const batchId = randomUUID();
  const rows = [];
  for (const b of baris) {
    const komoditas_id = await resolveKomoditasId(b);
    const key = b.komoditas_key != null ? String(b.komoditas_key).trim() : null;
    const yesterday = await getReferencePricePreviousDay({
      diinput_oleh,
      tanggalKemarin,
      pasar_id,
      pasar_nama,
      komoditas_key: key,
    });
    const soft = validateHargaBarisSoft(
      { harga_eceran: b.harga_eceran, komoditas_key: key },
      { yesterdayPrice: yesterday },
    );
    rows.push({
      batch_id: batchId,
      tanggal,
      pasar_id: pasar_id ?? null,
      pasar_nama: pasar_nama ?? null,
      kabupaten_kota: kabupaten_kota ?? "",
      komoditas_id,
      komoditas_key: key,
      komoditas_nama: b.nama ?? b.nama_komoditas ?? null,
      harga_eceran: b.harga_eceran,
      satuan: b.satuan || "kg",
      sumber_data: sumber_data || "survei_langsung",
      diinput_oleh,
      status: rowStatus,
      is_anomaly: soft.is_anomaly,
      anomaly_reason: soft.anomaly_reason,
    });
  }

  const created = await insertHargaPanganRows(rows);
  const anomalyCount = rows.filter((r) => r.is_anomaly).length;

  await logHargaPanganEntry({
    harga_pangan_id: null,
    batch_id: batchId,
    aksi: "CREATE",
    old_value: null,
    new_value: {
      tanggal,
      pasar_nama,
      jumlah_baris: created.length,
      anomaly_count: anomalyCount,
      batch_id: batchId,
      status: rowStatus,
    },
    actor_id: actor.id,
    actor_role: actor.role,
  });

  return {
    ok: true,
    batch_id: batchId,
    rows: created,
    anomaly_count: anomalyCount,
  };
}

/**
 * Verifikasi JF: update status + audit VERIFY.
 */
export async function verifyHargaBatch(batchId, verifikatorId, catatan, actor) {
  const result = await repoVerifyBatch(batchId, verifikatorId, catatan);
  if (!result.ok) return false;

  await logHargaPanganEntry({
    harga_pangan_id: null,
    batch_id: batchId,
    aksi: "VERIFY",
    old_value: {
      batch_id: batchId,
      jumlah_baris: result.rowsBefore.length,
      status_sebelumnya: HARGA_PANGAN_STATUS.MENUNGGU,
      row_ids: result.rowsBefore.map((r) => r.id),
    },
    new_value: {
      batch_id: batchId,
      status: HARGA_PANGAN_STATUS.TERVERIFIKASI,
      diverifikasi_oleh: verifikatorId,
      catatan_verifikasi: catatan || null,
    },
    actor_id: actor.id,
    actor_role: actor.role,
  });
  return true;
}

/**
 * Kembalikan ke pelaksana + audit RETURN.
 */
export async function returnHargaBatch(batchId, verifikatorId, catatan, actor) {
  const result = await repoReturnBatch(batchId, verifikatorId, catatan);
  if (!result.ok) return false;

  await logHargaPanganEntry({
    harga_pangan_id: null,
    batch_id: batchId,
    aksi: "RETURN",
    old_value: {
      batch_id: batchId,
      jumlah_baris: result.rowsBefore.length,
      status_sebelumnya: HARGA_PANGAN_STATUS.MENUNGGU,
      row_ids: result.rowsBefore.map((r) => r.id),
    },
    new_value: {
      batch_id: batchId,
      status: HARGA_PANGAN_STATUS.DIKEMBALIKAN,
      diverifikasi_oleh: verifikatorId,
      catatan_verifikasi: catatan,
    },
    actor_id: actor.id,
    actor_role: actor.role,
  });
  return true;
}

const ROLES_BYPASS_LOCK = ["super_admin", "kepala_dinas"];

function roleMayAmendVerified(role) {
  const r = (role || "").toLowerCase();
  return ROLES_BYPASS_LOCK.some((x) => r.includes(x));
}

/**
 * Koreksi data oleh admin (bypass lock terverifikasi). Wajib audit UPDATE.
 * Pelaksana/JF tidak boleh memanggil ini — enforced di route + guard.
 */
export async function adminAmendHargaPanganRow(rowId, { harga_eceran, alasan }, actor) {
  if (!roleMayAmendVerified(actor.role)) {
    return { ok: false, error: "forbidden_amend" };
  }
  const errs = validateHargaBarisHard(
    { harga_eceran, komoditas_key: "admin_amend" },
    { requireKomoditasKey: false },
  );
  if (errs.length) return { ok: false, hardErrors: errs };

  const row = await findHargaPanganByPk(rowId);
  if (!row) return { ok: false, error: "not_found" };

  const prev = row.toJSON();
  await row.update({ harga_eceran });

  await logHargaPanganEntry({
    harga_pangan_id: rowId,
    batch_id: row.batch_id,
    aksi: "UPDATE",
    old_value: {
      harga_eceran: prev.harga_eceran,
      status: prev.status,
      tanggal: prev.tanggal,
      komoditas_key: prev.komoditas_key,
    },
    new_value: {
      harga_eceran,
      alasan: alasan || null,
      status: row.status,
    },
    actor_id: actor.id,
    actor_role: actor.role,
  });

  return { ok: true, row: row.toJSON() };
}

/**
 * Guard untuk update/delete generik: baris terverifikasi terkunci bagi non-admin.
 * Panggil sebelum mutasi di masa depan (PATCH pelaksana, dll.).
 */
export function assertHargaRowMutableForRole(row, role) {
  if (!row) return { ok: false, error: "not_found" };
  if (row.status !== HARGA_PANGAN_STATUS.TERVERIFIKASI) return { ok: true };
  if (roleMayAmendVerified(role)) return { ok: true };
  return { ok: false, error: "terverifikasi_terkunci", code: "HARGA_LOCKED" };
}
