import AuditLog from "../models/auditLog.js";

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

    // Coerce IDs to strings where possible to avoid accidental type mismatch
    const ent = toStringSafe(entitas_id);
    const peg = toStringSafe(pegawai_id);
    if (ent !== undefined) payload.entitas_id = ent;
    if (peg !== undefined) payload.pegawai_id = peg;

    await AuditLog.create(payload);
  } catch (err) {
    // Swallow audit errors to avoid breaking primary flows (login/register/etc.)
    // Log a concise warning so operators can investigate DB schema/type mismatches.
    console.warn("Audit create failed:", err?.message || err);
    return null;
  }
}
