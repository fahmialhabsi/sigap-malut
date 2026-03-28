/**
 * dailyDigestService.js — Daily digest email notifikasi
 * Dokumen sumber: 14-alur-kerja-sekretariat-bidang-uptd.md
 *
 * Fungsi:
 * - Kirim ringkasan harian ke setiap user aktif: task pending, SLA breach, notifikasi belum dibaca
 * - Jadwal: setiap hari pukul 07:30 WIB (Senin–Jumat)
 * - Gunakan nodemailer jika tersedia, fallback ke console log
 */

import { createNotification } from "./notificationService.js";
import { cekStatusSLA } from "./slaService.js";

// ── Nodemailer setup (optional — gagal gracefully jika tidak ada) ────────────
async function getTransporter() {
  try {
    const nodemailer = (await import("nodemailer")).default;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Kirim email (dengan fallback ke console.log)
 */
async function sendEmail({ to, subject, html }) {
  const transporter = await getTransporter();
  if (!transporter || !process.env.SMTP_USER) {
    console.log(`[DailyDigest] [EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"SIGAP MALUT" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * Buat konten HTML email digest untuk satu user
 */
function buildDigestHTML({
  user,
  tasks = [],
  notifications = [],
  slaBreaches = [],
}) {
  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const taskRows =
    tasks.length > 0
      ? tasks
          .map((t) => {
            const sla = cekStatusSLA(t);
            const slaColor =
              sla.status === "breach"
                ? "#EF4444"
                : sla.status === "critical"
                  ? "#F97316"
                  : sla.status === "warning"
                    ? "#EAB308"
                    : "#22C55E";
            return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">${t.judul || "—"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;text-transform:capitalize">${t.status || "—"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;color:${slaColor};font-weight:600">
              ${sla.persentase}% (${sla.sisaJam}j tersisa)
            </td>
          </tr>`;
          })
          .join("")
      : `<tr><td colspan="3" style="padding:12px;text-align:center;color:#94A3B8">Tidak ada task aktif</td></tr>`;

  const notifItems =
    notifications
      .slice(0, 5)
      .map(
        (n) => `<li style="margin-bottom:6px;color:#475569">${n.message}</li>`,
      )
      .join("") || "<li style='color:#94A3B8'>Tidak ada notifikasi baru</li>";

  const breachItems =
    slaBreaches.length > 0
      ? slaBreaches
          .map(
            (t) =>
              `<li style="color:#EF4444;margin-bottom:4px">🚨 ${t.judul}</li>`,
          )
          .join("")
      : "<li style='color:#94A3B8'>Tidak ada pelanggaran SLA</li>";

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#F8FAFC">
      <div style="max-width:600px;margin:24px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08)">
        <!-- Header -->
        <div style="background:#0B5FFF;padding:24px 32px">
          <h1 style="margin:0;color:white;font-size:20px">📋 Digest Harian SIGAP MALUT</h1>
          <p style="margin:6px 0 0;color:#BFD4FF;font-size:14px">${tanggal}</p>
        </div>

        <div style="padding:24px 32px">
          <p style="color:#475569;margin-top:0">Selamat pagi, <strong>${user.nama || user.username}</strong>!</p>
          <p style="color:#475569">Berikut ringkasan aktivitas Anda hari ini:</p>

          <!-- Task aktif -->
          <h2 style="font-size:15px;color:#1E293B;margin:24px 0 12px">📌 Task Aktif (${tasks.length})</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="background:#F1F5F9">
                <th style="padding:8px 12px;text-align:left;color:#64748B;font-weight:600">Judul</th>
                <th style="padding:8px 12px;text-align:left;color:#64748B;font-weight:600">Status</th>
                <th style="padding:8px 12px;text-align:left;color:#64748B;font-weight:600">SLA</th>
              </tr>
            </thead>
            <tbody>${taskRows}</tbody>
          </table>

          <!-- SLA Breach -->
          <h2 style="font-size:15px;color:#1E293B;margin:24px 0 12px">⚠️ Pelanggaran SLA (${slaBreaches.length})</h2>
          <ul style="font-size:13px;padding-left:20px">${breachItems}</ul>

          <!-- Notifikasi -->
          <h2 style="font-size:15px;color:#1E293B;margin:24px 0 12px">🔔 Notifikasi Terbaru (${notifications.length})</h2>
          <ul style="font-size:13px;padding-left:20px">${notifItems}</ul>

          <!-- CTA -->
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.APP_URL || "http://localhost:5173"}/dashboard"
               style="background:#0B5FFF;color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">
              Buka Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#F8FAFC;padding:16px 32px;text-align:center;color:#94A3B8;font-size:12px;border-top:1px solid #E2E8F0">
          SIGAP MALUT — Dinas Pangan Maluku Utara<br>
          Email ini dikirim otomatis. Jangan balas email ini.
        </div>
      </div>
    </body>
    </html>`;
}

/**
 * Kirim digest ke semua user aktif.
 * Dipanggil oleh scheduler atau secara manual.
 */
export async function sendDailyDigestToAll() {
  try {
    const [UserModule, TaskModule, NotifModule] = await Promise.all([
      import("../models/User.js").catch(() => ({ default: null })),
      import("../models/Task.js").catch(() => ({ default: null })),
      import("../models/Notification.js").catch(() => ({ default: null })),
    ]);

    const User = UserModule.default;
    const Task = TaskModule.default;
    const Notification = NotifModule.default;

    if (!User) {
      console.log("[DailyDigest] Model User tidak tersedia, skip");
      return;
    }

    const { Op } = await import("sequelize");
    const users = await User.findAll({
      where: {
        deleted_at: null,
        is_active: { [Op.ne]: false },
        email: { [Op.ne]: null },
      },
    });

    console.log(`[DailyDigest] Mengirim digest ke ${users.length} user...`);
    let sent = 0;

    for (const user of users) {
      try {
        const [tasks, notifications] = await Promise.all([
          Task
            ? Task.findAll({
                where: {
                  assignee_id: user.id,
                  status: { [Op.notIn]: ["selesai", "ditolak", "dibatalkan"] },
                },
                limit: 10,
              })
            : [],
          Notification
            ? Notification.findAll({
                where: { target_user_id: user.id, seen: false },
                order: [["createdAt", "DESC"]],
                limit: 5,
              })
            : [],
        ]);

        const slaBreaches = (tasks || []).filter((t) => {
          const { status } = cekStatusSLA(t);
          return status === "breach";
        });

        const html = buildDigestHTML({
          user,
          tasks: tasks || [],
          notifications: notifications || [],
          slaBreaches,
        });

        await sendEmail({
          to: user.email,
          subject: `📋 Digest Harian SIGAP MALUT — ${new Date().toLocaleDateString("id-ID")}`,
          html,
        });

        // Buat juga in-app notification
        await createNotification(
          user.id,
          null,
          `📋 Digest harian dikirim: ${tasks?.length || 0} task aktif, ${slaBreaches.length} pelanggaran SLA`,
          "/dashboard",
        );

        sent++;
      } catch (userErr) {
        console.error(
          `[DailyDigest] Gagal kirim ke user ${user.id}:`,
          userErr.message,
        );
      }
    }

    console.log(
      `[DailyDigest] ✅ Selesai — ${sent}/${users.length} berhasil dikirim`,
    );
  } catch (err) {
    console.error("[DailyDigest] Error:", err.message);
  }
}

/**
 * Inisialisasi scheduler daily digest — panggil dari server.js
 * Jadwal: Senin–Jumat pukul 07:30
 */
export async function initDailyDigestScheduler() {
  try {
    const cron = (await import("node-cron")).default;
    cron.schedule("30 7 * * 1-5", async () => {
      console.log("[DailyDigest Scheduler] Mengirim digest harian...");
      await sendDailyDigestToAll();
    });
    console.log(
      "[DailyDigest Scheduler] ✅ Aktif — kirim setiap Senin–Jumat pukul 07:30",
    );
  } catch (err) {
    console.warn(
      "[DailyDigest Scheduler] node-cron tidak tersedia, skip:",
      err.message,
    );
  }
}

export default { sendDailyDigestToAll, initDailyDigestScheduler };
