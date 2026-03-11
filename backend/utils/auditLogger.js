/**
 * backend/utils/auditLogger.js
 *
 * Helper to insert rows into the public audit_log table.
 * Columns: modul, entitas_id, aksi, data_lama, data_baru, pegawai_id, created_at
 */
import AuditLog from "../models/auditLog.js";

/**
 * @param {object} params
 * @param {string} params.modul       - Module name, e.g. "tasks"
 * @param {string|number} params.entitasId  - Entity primary key
 * @param {string} params.aksi        - Action name: CREATE | UPDATE | DELETE | ASSIGN | TRANSITION
 * @param {object|null} params.dataLama     - Snapshot before change
 * @param {object|null} params.dataBaru     - Snapshot after change
 * @param {string|number} params.pegawaiId  - Actor user id
 */
export async function writeAuditLog({ modul, entitasId, aksi, dataLama = null, dataBaru = null, pegawaiId }) {
  try {
    await AuditLog.create({
      modul: String(modul || "tasks"),
      entitas_id: String(entitasId || ""),
      aksi: String(aksi || "ACTION").toUpperCase(),
      data_lama: dataLama,
      data_baru: dataBaru,
      pegawai_id: String(pegawaiId || ""),
    });
  } catch (err) {
    // Never throw - audit failures must not break the main flow
    console.error("[auditLogger] Failed to write audit log:", err?.message);
  }
}

export default writeAuditLog;
