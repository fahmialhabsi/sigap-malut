import { logAudit } from "./auditLogService.js";

export const EXEC_AUDIT_MODUL = {
  INSTRUKSI: "EXECUTIVE_INSTRUKSI",
  PENGAJUAN_KE_GUBERNUR: "EXECUTIVE_PENGAJUAN_KE_GUBERNUR",
  KADIN_INBOX: "EXECUTIVE_KADIN_INBOX",
  KADIN_APPROVAL_INTERNAL: "EXECUTIVE_KADIN_APPROVAL_INTERNAL",
};

export async function auditExecutiveAction({
  modul,
  entitas_id,
  aksi,
  pegawai_id,
  data_lama = null,
  data_baru = null,
}) {
  if (!modul || entitas_id == null || !aksi || pegawai_id == null) return null;
  return logAudit({
    modul,
    entitas_id: String(entitas_id),
    aksi,
    pegawai_id: String(pegawai_id),
    data_lama,
    data_baru,
  });
}
