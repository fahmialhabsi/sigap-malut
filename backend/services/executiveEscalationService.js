import { Op } from "sequelize";
import {
  InstruksiGubernur,
  PengajuanKeGubernur,
  NotifikasiGubernur,
} from "../models/index.js";
import { calendarDaysUntilDeadline } from "./instruksiReminderService.js";
import { loadExecutiveGovernance } from "./executiveGovernanceLoader.js";
import { enqueueSocketDelivery } from "./notificationOutboxService.js";
import { ROOMS } from "./socketService.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function hasNotifTodayPrefix(referensiId, referensiTabel, prefix) {
  const dayStart = startOfToday();
  const found = await NotifikasiGubernur.findOne({
    where: {
      referensi_id: referensiId,
      referensi_tabel: referensiTabel,
      judul: { [Op.like]: `${prefix}%` },
      created_at: { [Op.gte]: dayStart },
    },
  });
  return !!found;
}

function daysPastDeadline(deadlineStr) {
  const diff = calendarDaysUntilDeadline(deadlineStr);
  if (diff === null) return null;
  return diff < 0 ? -diff : 0;
}

/**
 * Eskalasi pasca-deadline (H+1, H+2, H+3) + peringatan pengajuan mendekati batas.
 */
export async function runExecutiveEscalation() {
  const cfg = loadExecutiveGovernance();
  const batas = Number(cfg.pengajuan_ke_gubernur?.batas_menunggu_keputusan_hari || 14);
  const peringatan = cfg.pengajuan_ke_gubernur?.peringatan_hari_sebelum_batas || [7, 3, 1];

  const instruksi = await InstruksiGubernur.findAll({
    where: {
      status: { [Op.notIn]: ["draf", "selesai"] },
      deadline: { [Op.ne]: null },
    },
  });

  let instrEsc = 0;
  for (const row of instruksi) {
    const past = daysPastDeadline(row.deadline);
    if (past === null || past < 1) continue;
    const govId = row.created_by;
    const nomor = row.nomor_instruksi || `#${row.id}`;

    const tiers = [
      { min: 1, prefix: "Eskalasi H+1:", judul: `Eskalasi H+1: ${nomor}`, jenis: "deadline_dekat" },
      { min: 2, prefix: "Eskalasi H+2:", judul: `Eskalasi H+2: ${nomor}`, jenis: "alert_kritis" },
      { min: 3, prefix: "Eskalasi H+3:", judul: `Eskalasi H+3 (kritis): ${nomor}`, jenis: "alert_kritis" },
    ];

    for (const t of tiers) {
      if (past < t.min) continue;
      if (await hasNotifTodayPrefix(row.id, "instruksi_gubernur", t.prefix))
        continue;
      await NotifikasiGubernur.create({
        user_id: govId,
        jenis: t.jenis,
        judul: t.judul,
        isi: row.judul,
        referensi_id: row.id,
        referensi_tabel: "instruksi_gubernur",
        sudah_dibaca: false,
      }).catch(() => null);
      await enqueueSocketDelivery({
        eventKey: `esc|${row.id}|${t.min}|${startOfToday().toISOString().slice(0, 10)}`,
        room: ROOMS.GUBERNUR,
        event: "gubernur:instruksi:escalation",
        data: { id: row.id, tier: t.min, nomor },
      }).catch(() => null);
      instrEsc += 1;
    }
  }

  const pengajuan = await PengajuanKeGubernur.findAll({
    where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
  });

  let pengEsc = 0;
  for (const row of pengajuan) {
    const created = row.created_at ? new Date(row.created_at) : new Date();
    const usia = Math.floor((Date.now() - created) / 86400000);
    const sisa = batas - usia;
    if (!peringatan.includes(sisa)) continue;
    const prefix = `Pengajuan peringatan sisa ${sisa} h:`;
    if (await hasNotifTodayPrefix(row.id, "pengajuan_ke_gubernur", prefix))
      continue;
    const govRows = await import("./gubernurUserService.js").then((m) =>
      m.getGubernurUserIds(),
    );
    for (const gid of govRows) {
      await NotifikasiGubernur.create({
        user_id: gid,
        jenis: "pengajuan_masuk",
        judul: `${prefix} ${row.nomor_pengajuan || row.id}`,
        isi: row.judul,
        referensi_id: row.id,
        referensi_tabel: "pengajuan_ke_gubernur",
        sudah_dibaca: false,
      }).catch(() => null);
    }
    await enqueueSocketDelivery({
      eventKey: `pengwarn|${row.id}|${sisa}|${startOfToday().toISOString().slice(0, 10)}`,
      room: ROOMS.GUBERNUR,
      event: "gubernur:pengajuan:peringatan",
      data: { id: row.id, sisa_hari: sisa },
    }).catch(() => null);
    pengEsc += 1;
  }

  return { instruksi_escalation_events: instrEsc, pengajuan_warnings: pengEsc };
}
