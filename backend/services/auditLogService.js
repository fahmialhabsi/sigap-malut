import AuditLog from "../models/auditLog.js";
import HargaPanganLog from "../models/HargaPanganLog.js";
import { notifyItOfUserMgmtAudit } from "./itAuditEmailService.js";

function toStringSafe(v) {
  if (v === null || v === undefined) return undefined;
  return typeof v === "string" ? v : String(v);
}

export async function logAudit({
  modul,
  entitas_id,
  aksi,
  data_lama,
  data_baru,
  pegawai_id,
}) {
  try {
    const payload = {
      modul,
      aksi,
      data_lama,
      data_baru,
      created_at: new Date(),
    };

    const ent = toStringSafe(entitas_id);
    const peg = toStringSafe(pegawai_id);
    if (ent !== undefined) payload.entitas_id = ent;
    if (peg !== undefined) payload.pegawai_id = peg;

    await AuditLog.create(payload);
    if (modul === "USER_MANAGEMENT") {
      void notifyItOfUserMgmtAudit({
        modul,
        aksi,
        entitas_id: ent,
        pegawai_id: peg,
        data_lama,
        data_baru,
      });
    }
  } catch (err) {
    console.warn("Audit create failed:", err?.message || err);
    return null;
  }
}

/**
 * Audit khusus modul harga_pangan (tabel harga_pangan_logs) — jejak CREATE/VERIFY/RETURN/UPDATE.
 */
export async function logHargaPanganEntry({
  harga_pangan_id = null,
  batch_id = null,
  aksi,
  old_value = null,
  new_value = null,
  actor_id,
  actor_role = null,
}) {
  if (!aksi || actor_id == null) {
    console.warn("[auditLogService] logHargaPanganEntry: aksi atau actor_id hilang, dilewati.");
    return null;
  }
  try {
    return await HargaPanganLog.create({
      harga_pangan_id,
      batch_id,
      aksi,
      old_value,
      new_value,
      actor_id,
      actor_role: actor_role != null ? String(actor_role) : null,
    });
  } catch (e) {
    console.error("[auditLogService] gagal menulis harga_pangan_logs:", e.message);
    return null;
  }
}
