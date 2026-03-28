import { useEffect, useRef } from "react";

/**
 * ConfirmModal — Modal konfirmasi aksi destruktif (hapus, reset, dll).
 * Menggantikan window.confirm() di seluruh aplikasi.
 *
 * Props:
 *   isOpen       : boolean  — tampilkan modal
 *   title        : string   — judul modal
 *   message      : string   — pesan konfirmasi
 *   onConfirm    : function — callback saat tombol konfirmasi diklik
 *   onCancel     : function — callback saat tombol batal / tekan Escape
 *   loading      : boolean  — menampilkan spinner di tombol konfirmasi
 *   confirmLabel : string   — teks tombol konfirmasi (default: "Ya, Hapus")
 *   confirmClass : string   — kelas Tailwind tombol konfirmasi (default: merah)
 */
export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = "Ya, Hapus",
  confirmClass = "bg-red-600 hover:bg-red-700 focus:ring-red-400",
}) {
  const cancelRef = useRef(null);

  // Tutup modal saat Escape ditekan
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  // Focus ke tombol Batal saat modal terbuka (lebih aman)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!loading ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Ikon + Judul */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-lg" aria-hidden="true">
              ⚠️
            </span>
          </div>
          <h2
            id="confirm-modal-title"
            className="text-lg font-semibold text-slate-800"
          >
            {title}
          </h2>
        </div>

        {/* Pesan */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

        {/* Tombol */}
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors inline-flex items-center gap-2 ${confirmClass}`}
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
