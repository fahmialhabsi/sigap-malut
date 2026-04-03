import { Op } from "sequelize";
import { InstruksiGubernur, NotifikasiGubernur } from "../models/index.js";
import { getIO, ROOMS } from "./socketService.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateOnly(s) {
  if (!s) return null;
  const d = new Date(`${String(s).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Selisih hari kalender: deadline - hariIni (positif = masih sisa hari). */
export function calendarDaysUntilDeadline(deadlineStr) {
  const end = parseDateOnly(deadlineStr);
  if (!end) return null;
  const start = startOfToday();
  end.setHours(0, 0, 0, 0);
  return Math.round((end - start) / 86400000);
}

async function hasReminderToday(referensiId, labelPrefix) {
  const dayStart = startOfToday();
  const found = await NotifikasiGubernur.findOne({
    where: {
      referensi_id: referensiId,
      referensi_tabel: "instruksi_gubernur",
      judul: { [Op.like]: `${labelPrefix}%` },
      created_at: { [Op.gte]: dayStart },
    },
  });
  return !!found;
}

/**
 * Pengingat harian: H-2, H-1, H0, lewat deadline + status terlambat.
 * Dipanggil dari cron (mis. 07:00).
 */
export async function runInstruksiReminders() {
  const rows = await InstruksiGubernur.findAll({
    where: {
      status: { [Op.notIn]: ["draf", "selesai"] },
      deadline: { [Op.ne]: null },
    },
  });

  const io = getIO();

  for (const row of rows) {
    const diff = calendarDaysUntilDeadline(row.deadline);
    if (diff === null) continue;

    const govId = row.created_by;
    const nomor = row.nomor_instruksi || `#${row.id}`;

    if (diff < 0 && row.status !== "selesai") {
      if (row.status !== "terlambat") {
        row.status = "terlambat";
        await row.save();
      }
      const prefix = `Terlambat:`;
      if (!(await hasReminderToday(row.id, prefix))) {
        await NotifikasiGubernur.create({
          user_id: govId,
          jenis: "alert_kritis",
          judul: `${prefix} ${nomor}`,
          isi: `${row.judul} — melewati batas ${row.deadline}`,
          referensi_id: row.id,
          referensi_tabel: "instruksi_gubernur",
          sudah_dibaca: false,
        }).catch(() => null);
        if (io) {
          io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:terlambat", {
            id: row.id,
            nomor,
          });
        }
      }
      continue;
    }

    const reminders = [
      { days: 2, label: "Deadline H-2", jenis: "deadline_dekat" },
      { days: 1, label: "Deadline H-1", jenis: "deadline_dekat" },
      { days: 0, label: "Deadline hari ini", jenis: "deadline_dekat" },
    ];

    for (const r of reminders) {
      if (diff !== r.days) continue;
      const prefix = `${r.label}:`;
      if (await hasReminderToday(row.id, prefix)) continue;
      await NotifikasiGubernur.create({
        user_id: govId,
        jenis: r.jenis,
        judul: `${prefix} ${nomor}`,
        isi: row.judul,
        referensi_id: row.id,
        referensi_tabel: "instruksi_gubernur",
        sudah_dibaca: false,
      }).catch(() => null);
      if (io) {
        io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:deadline_reminder", {
          id: row.id,
          nomor,
          tingkat: r.label,
        });
      }
    }
  }

  return { ok: true, scanned: rows.length };
}
