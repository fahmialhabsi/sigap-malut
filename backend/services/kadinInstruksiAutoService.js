/**
 * Menyelesaikan instruksi Gubernur secara otomatis ketika seluruh task turunan
 * (Task.metadata.sumber_instruksi_gubernur_id) yang dibuat Kepala Dinas sudah closed.
 */
import { Op } from "sequelize";
import Task from "../models/Task.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import NotifikasiGubernur from "../models/NotifikasiGubernur.js";
import { getIO, ROOMS } from "./socketService.js";

function turunanForInstruksi(tasks, instruksiId) {
  const id = Number(instruksiId);
  return tasks.filter(
    (t) => Number(t.metadata?.sumber_instruksi_gubernur_id) === id,
  );
}

export async function finalizeInstruksiIfAllTurunanClosed(instruksiId) {
  const row = await InstruksiGubernur.findByPk(instruksiId);
  if (!row || row.status === "selesai") return { done: false, reason: "skip" };

  const kadinId = row.assigned_to;
  const tasks = await Task.findAll({
    where: { created_by: kadinId },
  }).catch(() => []);

  const turunan = turunanForInstruksi(tasks, instruksiId);
  if (turunan.length === 0) return { done: false, reason: "no_turunan" };

  const allClosed = turunan.every(
    (t) => String(t.status || "").toLowerCase() === "closed",
  );
  if (!allClosed) return { done: false, reason: "not_all_closed" };

  row.status = "selesai";
  row.selesai_at = new Date();
  row.laporan_pelaksanaan =
    row.laporan_pelaksanaan ||
    `Otomatis: seluruh turunan perintah untuk instruksi ini telah ditutup (${turunan.length} tugas).`;
  await row.save();

  const io = getIO();
  if (io) {
    io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:selesai", {
      id: row.id,
      nomor: row.nomor_instruksi,
      judul: row.judul,
      selesai_at: row.selesai_at,
      otomatis: true,
    });
  }

  await NotifikasiGubernur.create({
    user_id: row.created_by,
    jenis: "perintah_selesai",
    judul: "Instruksi selesai (otomatis)",
    isi: `${row.nomor_instruksi || `#${row.id}`} — ${row.judul}`,
    referensi_id: row.id,
    referensi_tabel: "instruksi_gubernur",
    sudah_dibaca: false,
  }).catch(() => null);

  return { done: true, data: row };
}

/** Dipanggil setelah task ditutup: jika task turunan instruksi, cek apakah instruksi induk bisa diselesaikan. */
export async function checkAndCompleteInstruksiIfDueAfterTaskClosed(task) {
  const igId = task?.metadata?.sumber_instruksi_gubernur_id;
  if (!igId) return;
  await finalizeInstruksiIfAllTurunanClosed(Number(igId));
}

/** Menjalankan pengecekan untuk semua instruksi Kepala Dinas yang belum selesai (mis. saat buka inbox). */
export async function runAutoCompleteInstruksiForKadin(kadinId) {
  const rows = await InstruksiGubernur.findAll({
    where: {
      assigned_to: kadinId,
      status: { [Op.notIn]: ["selesai"] },
    },
  }).catch(() => []);

  const tasks = await Task.findAll({ where: { created_by: kadinId } }).catch(
    () => [],
  );

  for (const row of rows) {
    const turunan = turunanForInstruksi(tasks, row.id);
    if (turunan.length === 0) continue;
    const allClosed = turunan.every(
      (t) => String(t.status || "").toLowerCase() === "closed",
    );
    if (allClosed) await finalizeInstruksiIfAllTurunanClosed(row.id);
  }
}
