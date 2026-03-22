/**
 * slaService.js — SLA tracking & escalation scheduler
 * Dokumen sumber: 14-alur-kerja-sekretariat-bidang-uptd.md
 *
 * SLA default per tipe laporan:
 *   laporan_harian   : 1 hari kerja
 *   laporan_mingguan : 3 hari kerja
 *   laporan_bulanan  : 7 hari kerja
 *   disposisi        : 2 hari kerja
 *   verifikasi       : 3 hari kerja
 *
 * Escalation logic:
 *   - 50% SLA terlewat → notifikasi peringatan ke pelaksana
 *   - 80% SLA terlewat → notifikasi ke atasan langsung
 *   - 100% SLA terlewat (breach) → notifikasi ke kepala bidang + catat breach
 */

import { Op } from "sequelize";
import { createNotification } from "./notificationService.js";

// SLA dalam jam kerja (asumsi 8 jam/hari)
const SLA_HOURS = {
  laporan_harian: 8, // 1 hari
  laporan_mingguan: 24, // 3 hari
  laporan_bulanan: 56, // 7 hari
  disposisi: 16, // 2 hari
  verifikasi: 24, // 3 hari
  default: 24,
};

/**
 * Hitung jam kerja yang telah berlalu sejak waktu_mulai.
 * Asumsi hari kerja Senin–Jumat, 08:00–16:00 WIT.
 */
export function hitungJamKerja(waktuMulai, waktuSekarang = new Date()) {
  let total = 0;
  const cur = new Date(waktuMulai);
  const end = new Date(waktuSekarang);

  while (cur < end) {
    const day = cur.getDay(); // 0=Minggu, 6=Sabtu
    const hour = cur.getHours();
    if (day >= 1 && day <= 5 && hour >= 8 && hour < 16) {
      total++;
    }
    cur.setHours(cur.getHours() + 1);
  }
  return total;
}

/**
 * Ambil SLA hours untuk tipe task
 */
export function getSLAHours(tipe) {
  return SLA_HOURS[tipe] || SLA_HOURS.default;
}

/**
 * Hitung persentase SLA yang sudah dipakai (0–100+)
 */
export function getSLAPersentase(task) {
  const slaMax = getSLAHours(task.tipe || "default");
  const elapsed = hitungJamKerja(task.createdAt || task.tanggal_mulai);
  return Math.round((elapsed / slaMax) * 100);
}

/**
 * Cek status SLA sebuah task
 * @returns { status: 'ok'|'warning'|'critical'|'breach', persentase, sisaJam }
 */
export function cekStatusSLA(task) {
  const persen = getSLAPersentase(task);
  const slaMax = getSLAHours(task.tipe || "default");
  const elapsed = hitungJamKerja(task.createdAt || task.tanggal_mulai);
  const sisaJam = Math.max(0, slaMax - elapsed);

  let status;
  if (persen >= 100) status = "breach";
  else if (persen >= 80) status = "critical";
  else if (persen >= 50) status = "warning";
  else status = "ok";

  return { status, persentase: persen, sisaJam };
}

/**
 * Jalankan pengecekan SLA untuk semua task aktif.
 * Dipanggil oleh scheduler (node-cron) setiap jam.
 */
export async function runSLACheck() {
  try {
    // Dynamic import model Task agar tidak circular dependency
    const { default: Task } = await import("../models/Task.js").catch(() => ({
      default: null,
    }));
    if (!Task) {
      console.log("[SLA] Model Task tidak tersedia, skip check");
      return;
    }

    const activeTasks = await Task.findAll({
      where: {
        status: { [Op.notIn]: ["selesai", "ditolak", "dibatalkan"] },
      },
    });

    let warnings = 0,
      criticals = 0,
      breaches = 0;

    for (const task of activeTasks) {
      const { status, persentase, sisaJam } = cekStatusSLA(task);

      if (status === "ok") continue;

      const targetId = task.assignee_id || task.created_by;

      if (status === "warning" && !task.sla_warned_50) {
        await createNotification(
          targetId,
          task.id,
          `⚠️ SLA ${task.judul || "Task"}: ${persentase}% terpakai, sisa ±${sisaJam} jam kerja`,
          `/tasks/${task.id}`,
        );
        await task.update({ sla_warned_50: true }).catch(() => null);
        warnings++;
      }

      if (status === "critical" && !task.sla_warned_80) {
        // Notifikasi ke pelaksana dan supervisor
        await createNotification(
          targetId,
          task.id,
          `🔴 KRITIS: SLA ${task.judul || "Task"} ${persentase}% terpakai! Sisa ±${sisaJam} jam`,
          `/tasks/${task.id}`,
        );
        if (task.supervisor_id) {
          await createNotification(
            task.supervisor_id,
            task.id,
            `🔴 Eskalasi: Task "${task.judul}" milik user ${targetId} mendekati batas SLA (${persentase}%)`,
            `/tasks/${task.id}`,
          );
        }
        await task.update({ sla_warned_80: true }).catch(() => null);
        criticals++;
      }

      if (status === "breach" && !task.sla_breached) {
        await createNotification(
          targetId,
          task.id,
          `🚨 PELANGGARAN SLA: Task "${task.judul}" melewati batas waktu!`,
          `/tasks/${task.id}`,
        );
        if (task.supervisor_id) {
          await createNotification(
            task.supervisor_id,
            task.id,
            `🚨 SLA Breach: Task "${task.judul}" melewati batas waktu. Tindak lanjut diperlukan.`,
            `/tasks/${task.id}`,
          );
        }
        await task
          .update({ sla_breached: true, status: "eskalasi" })
          .catch(() => null);
        breaches++;
      }
    }

    console.log(
      `[SLA Check] ${activeTasks.length} task diperiksa — ${warnings} warning, ${criticals} kritis, ${breaches} breach`,
    );
  } catch (err) {
    console.error("[SLA Check] Error:", err.message);
  }
}

/**
 * Inisialisasi scheduler SLA — panggil dari server.js
 * Jadwal: setiap jam pada hari kerja (08:00–17:00)
 */
export async function initSLAScheduler() {
  try {
    const cron = (await import("node-cron")).default;
    // Setiap jam, Senin–Jumat, 08:00–17:00
    cron.schedule("0 8-17 * * 1-5", async () => {
      console.log("[SLA Scheduler] Menjalankan SLA check...");
      await runSLACheck();
    });
    console.log(
      "[SLA Scheduler] ✅ Aktif — cek setiap jam (08:00–17:00, Senin–Jumat)",
    );
  } catch (err) {
    console.warn(
      "[SLA Scheduler] node-cron tidak tersedia, skip:",
      err.message,
    );
  }
}

export default {
  runSLACheck,
  initSLAScheduler,
  cekStatusSLA,
  getSLAPersentase,
  getSLAHours,
};
