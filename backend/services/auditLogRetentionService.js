import { Op } from "sequelize";
import sequelize from "../config/database.js";
import AuditLog from "../models/auditLog.js";
import AuditLogArchive from "../models/AuditLogArchive.js";

const USER_MGMT = "USER_MANAGEMENT";

/**
 * Memindahkan jejak audit Manajemen User yang lebih tua dari batas hari ke audit_log_archive,
 * lalu menghapus permanen dari audit_log (retensi).
 * @param {{ olderThanDays?: number }} opts — minimal 30, maks 3650, default dari env AUDIT_LOG_RETENTION_DAYS atau 365
 */
export async function archiveUserManagementAuditOlderThan(opts = {}) {
  const envDefault = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || "365", 10);
  const requested =
    opts.olderThanDays != null
      ? Number(opts.olderThanDays)
      : Number.isFinite(envDefault)
        ? envDefault
        : 365;
  const days = Math.max(30, Math.min(3650, requested));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let moved = 0;

  await sequelize.transaction(async (t) => {
    const rows = await AuditLog.findAll({
      where: {
        modul: USER_MGMT,
        created_at: { [Op.lt]: cutoff },
      },
      transaction: t,
    });

    for (const r of rows) {
      const plain = r.get({ plain: true });
      await AuditLogArchive.create(
        {
          original_audit_log_id: plain.id,
          modul: plain.modul,
          entitas_id: plain.entitas_id,
          aksi: plain.aksi,
          data_lama: plain.data_lama ?? null,
          data_baru: plain.data_baru ?? null,
          pegawai_id: plain.pegawai_id,
          source_created_at: plain.created_at,
          archived_at: new Date(),
        },
        { transaction: t },
      );
      await r.destroy({ force: true, transaction: t });
      moved += 1;
    }
  });

  return {
    moved,
    olderThanDays: days,
    cutoff_iso: cutoff.toISOString(),
  };
}
