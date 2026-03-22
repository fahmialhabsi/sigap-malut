/**
 * MFASetupModal — multi-step 2FA wizard (email OTP)
 * Dokumen sumber: 13-System-Architecture-Document.md
 *
 * Step 1: user klik "Aktifkan 2FA" → sistem kirim kode OTP ke email
 * Step 2: user masukkan 6-digit kode
 * Step 3: konfirmasi sukses / gagal
 */

import { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const STEPS = { INTRO: "intro", VERIFY: "verify", DONE: "done" };

export default function MFASetupModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(STEPS.INTRO);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/mfa/send-otp");
      setStep(STEPS.VERIFY);
      toast.success("Kode OTP dikirim ke email Anda");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/mfa/verify-otp", { code });
      setStep(STEPS.DONE);
      toast.success("2FA berhasil diaktifkan");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/mfa/disable");
      toast.success("2FA dinonaktifkan");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menonaktifkan 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <h2 className="text-white font-bold text-lg">
            🔐 Autentikasi Dua Faktor (2FA)
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {step === STEPS.INTRO && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Apa itu 2FA?</p>
                <p>
                  Setiap login, sistem akan mengirim kode OTP 6 digit ke email
                  Anda. Kode ini berlaku selama <strong>5 menit</strong>.
                </p>
              </div>
              <p className="text-slate-600 text-sm">
                Aktifkan 2FA untuk melindungi akun Anda dari akses tidak sah.
              </p>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60 transition"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {loading ? "Mengirim..." : "Kirim Kode OTP ke Email"}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
              <button
                onClick={handleDisable}
                disabled={loading}
                className="w-full text-center text-xs text-red-500 hover:underline mt-1"
              >
                Nonaktifkan 2FA yang sudah aktif
              </button>
            </div>
          )}

          {step === STEPS.VERIFY && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Masukkan kode 6 digit yang dikirim ke email Anda. Kode berlaku{" "}
                <strong>5 menit</strong>.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] font-mono border-2 border-slate-300 rounded-xl py-3 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60 transition"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </button>
                <button
                  onClick={() => {
                    setStep(STEPS.INTRO);
                    setCode("");
                    setError("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Kembali
                </button>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-center text-xs text-blue-500 hover:underline"
              >
                Kirim ulang kode
              </button>
            </div>
          )}

          {step === STEPS.DONE && (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">✅</div>
              <h3 className="font-bold text-slate-800 text-lg">
                2FA Berhasil Diaktifkan
              </h3>
              <p className="text-slate-500 text-sm">
                Mulai sekarang, setiap login akan memerlukan kode OTP dari email
                Anda.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-white font-semibold"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
