/**
 * Rate limiting khusus endpoint autentikasi — Tahap 1 keamanan (brute-force).
 */
import rateLimit from "express-rate-limit";

/** Login: batasi percobaan per IP (dokumen 14: rate limit). */
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_LOGIN_MAX_PER_WINDOW || 40),
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan login dari alamat ini. Coba lagi setelah beberapa menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/** Register publik (jika tetap dibuka): lebih ketat. */
export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.AUTH_REGISTER_MAX_PER_HOUR || 10),
  message: {
    success: false,
    message: "Batas pendaftaran per jam tercapai. Hubungi administrator.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
