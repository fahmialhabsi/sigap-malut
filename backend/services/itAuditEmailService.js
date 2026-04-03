/**
 * Notifikasi email ke tim IT untuk jejak audit Manajemen User.
 * Konfigurasi (.env):
 * - IT_AUDIT_NOTIFY_EMAILS — alamat dipisah koma, wajib untuk mengirim email
 * - IT_AUDIT_NOTIFY_EVENTS — opsional: "all" atau daftar aksi dipisah koma
 *   Default: ROLE_AUTO_CREATED,DELETE,CREATE (UPDATE tidak dikirim agar tidak spam)
 * SMTP: sama dengan digest (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
 */

async function getTransporter() {
  try {
    const nodemailer = (await import("nodemailer")).default;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
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

function parseNotifyEvents() {
  const raw = (
    process.env.IT_AUDIT_NOTIFY_EVENTS ||
    "ROLE_AUTO_CREATED,DELETE,CREATE"
  ).trim();
  if (raw.toLowerCase() === "all") return { mode: "all" };
  const set = new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return { mode: "list", set };
}

function shouldNotify(aksi) {
  const cfg = parseNotifyEvents();
  if (cfg.mode === "all") return true;
  return cfg.set.has(aksi);
}

function summarizeJson(v, maxLen = 400) {
  if (v == null) return "—";
  try {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  } catch {
    return String(v);
  }
}

/**
 * Dipanggil setelah baris audit Manajemen User tersimpan (non-blocking dari sisi bisnis utama).
 */
export async function notifyItOfUserMgmtAudit({
  modul,
  aksi,
  entitas_id,
  pegawai_id,
  data_lama,
  data_baru,
}) {
  if (modul !== "USER_MANAGEMENT") return;
  const toRaw = process.env.IT_AUDIT_NOTIFY_EMAILS;
  if (!toRaw || !toRaw.trim()) return;
  if (!shouldNotify(aksi)) return;

  const recipients = toRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) return;

  const subject = `[SIGAP MALUT] Audit Manajemen User — ${aksi}`;
  const html = `
<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"></head>
<body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#F8FAFC;color:#1e293b">
  <div style="max-width:640px;margin:20px auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
    <h1 style="font-size:18px;margin:0 0 12px;color:#0f172a">Jejak audit — Manajemen User</h1>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b;width:140px">Aksi</td><td style="padding:6px 0;font-weight:600">${escapeHtml(aksi)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">ID entitas</td><td style="padding:6px 0;font-family:monospace">${escapeHtml(String(entitas_id ?? "—"))}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Pelaku (pegawai_id)</td><td style="padding:6px 0;font-family:monospace">${escapeHtml(String(pegawai_id ?? "—"))}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;vertical-align:top">Data lama</td><td style="padding:6px 0;white-space:pre-wrap;word-break:break-word">${escapeHtml(summarizeJson(data_lama))}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;vertical-align:top">Data baru</td><td style="padding:6px 0;white-space:pre-wrap;word-break:break-word">${escapeHtml(summarizeJson(data_baru))}</td></tr>
    </table>
    <p style="font-size:12px;color:#94a3b8;margin-top:20px">Email otomatis dari SIGAP MALUT. Sesuaikan IT_AUDIT_NOTIFY_* dan SMTP di server.</p>
  </div>
</body></html>`;

  try {
    const transporter = await getTransporter();
    if (!transporter || !process.env.SMTP_USER) {
      console.log(
        `[IT Audit Email] (mock) To: ${recipients.join(", ")} | ${subject}`,
      );
      return;
    }
    await transporter.sendMail({
      from: `"SIGAP MALUT — Audit" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject,
      html,
    });
  } catch (err) {
    console.warn("[IT Audit Email] Gagal kirim:", err?.message || err);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
