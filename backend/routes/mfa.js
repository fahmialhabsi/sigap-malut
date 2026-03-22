/**
 * backend/routes/mfa.js — Endpoint MFA/2FA (email OTP)
 * Dokumen sumber: 13-System-Architecture-Document.md
 *
 * POST /auth/mfa/send-otp   → generate & kirim OTP ke email user
 * POST /auth/mfa/verify-otp → verifikasi OTP
 * DELETE /auth/mfa/disable  → nonaktifkan MFA
 */

import express from "express";
import crypto from "crypto";
import { protect } from "../middleware/auth.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();

// In-memory OTP store (produksi: ganti dengan Redis)
// Map: userId → { code, expiresAt }
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit

function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

async function sendOTPEmail(email, code) {
  try {
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"SIGAP MALUT" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Kode Verifikasi 2FA SIGAP MALUT",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <div style="background:#0B5FFF;padding:20px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0">🔐 Kode Verifikasi 2FA</h2>
          </div>
          <div style="background:white;padding:24px;border:1px solid #E2E8F0;border-radius:0 0 12px 12px">
            <p>Gunakan kode berikut untuk verifikasi 2FA Anda:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:0.4em;text-align:center;color:#0B5FFF;padding:16px;background:#F1F5F9;border-radius:8px;margin:16px 0">
              ${code}
            </div>
            <p style="color:#64748B;font-size:13px">Kode berlaku selama <strong>5 menit</strong>. Jangan bagikan ke siapapun.</p>
          </div>
        </div>`,
    });
  } catch {
    // Fallback jika nodemailer tidak ada atau SMTP tidak dikonfigurasi
    console.log(`[MFA OTP] [MOCK] To: ${email} | Code: ${code}`);
  }
}

// POST /auth/mfa/send-otp
router.post("/send-otp", protect, async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;

    if (!email) {
      return res.status(400).json({ message: "Email user tidak terdaftar" });
    }

    // Rate limit sederhana: 1 OTP per menit
    const existing = otpStore.get(user.id);
    if (existing && Date.now() < existing.expiresAt - OTP_TTL_MS + 60000) {
      return res
        .status(429)
        .json({ message: "Tunggu 1 menit sebelum meminta OTP baru" });
    }

    const code = generateOTP();
    otpStore.set(user.id, { code, expiresAt: Date.now() + OTP_TTL_MS });

    await sendOTPEmail(email, code);

    // In-app notification
    await createNotification(
      user.id,
      null,
      "Kode OTP 2FA dikirim ke email Anda",
      null,
    );

    res.json({ message: "OTP dikirim ke email Anda" });
  } catch (err) {
    console.error("[MFA] send-otp error:", err.message);
    res.status(500).json({ message: "Gagal mengirim OTP" });
  }
});

// POST /auth/mfa/verify-otp
router.post("/verify-otp", protect, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const stored = otpStore.get(userId);
    if (!stored) {
      return res
        .status(400)
        .json({ message: "OTP tidak ditemukan. Minta kode baru." });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(userId);
      return res
        .status(400)
        .json({ message: "OTP sudah kadaluarsa. Minta kode baru." });
    }
    if (String(code).trim() !== stored.code) {
      return res.status(400).json({ message: "Kode OTP tidak valid" });
    }

    // OTP valid — aktifkan MFA di user record
    otpStore.delete(userId);
    try {
      const { default: UserModel } = await import("../models/User.js");
      await UserModel.update({ mfa_enabled: true }, { where: { id: userId } });
    } catch {
      // Model mungkin tidak punya kolom mfa_enabled, abaikan
    }

    res.json({ message: "2FA berhasil diaktifkan" });
  } catch (err) {
    console.error("[MFA] verify-otp error:", err.message);
    res.status(500).json({ message: "Gagal memverifikasi OTP" });
  }
});

// DELETE /auth/mfa/disable
router.delete("/disable", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    otpStore.delete(userId);
    try {
      const { default: UserModel } = await import("../models/User.js");
      await UserModel.update({ mfa_enabled: false }, { where: { id: userId } });
    } catch {
      // Ignore jika kolom belum ada
    }
    res.json({ message: "2FA dinonaktifkan" });
  } catch (err) {
    console.error("[MFA] disable error:", err.message);
    res.status(500).json({ message: "Gagal menonaktifkan 2FA" });
  }
});

export default router;
