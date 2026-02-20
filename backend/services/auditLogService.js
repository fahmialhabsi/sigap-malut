import AuditLog from "../models/auditLog.js";

export async function logAudit({
  modul,
  entitas_id,
  aksi,
  data_lama,
  data_baru,
  pegawai_id,
}) {
  await AuditLog.create({
    modul,
    entitas_id,
    aksi,
    data_lama,
    data_baru,
    pegawai_id,
    created_at: new Date(),
  });
}
