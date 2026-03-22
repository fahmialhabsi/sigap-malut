import { useEffect, useRef, useCallback } from "react";
import useAuthStore from "../stores/authStore";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit
const WARNING_BEFORE_MS = 60 * 1000;    // peringatan 1 menit sebelum logout

const ACTIVITY_EVENTS = [
  "mousedown", "mousemove", "keydown",
  "scroll", "touchstart", "click", "keypress",
];

/**
 * useIdleLogout — Auto-logout setelah 15 menit tidak aktif.
 * Dipasang di level App agar aktif di semua halaman private.
 * Hanya berjalan jika user sedang authenticated.
 */
export default function useIdleLogout({ onWarning, onLogout } = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const timerRef = useRef(null);
  const warnTimerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(warnTimerRef.current);

    // Warning 1 menit sebelum logout
    warnTimerRef.current = setTimeout(() => {
      onWarning?.();
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Logout setelah 15 menit idle
    timerRef.current = setTimeout(() => {
      logout();
      onLogout?.();
    }, IDLE_TIMEOUT_MS);
  }, [logout, onWarning, onLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Mulai timer saat authenticated
    resetTimer();

    // Attach event listeners
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, resetTimer, { passive: true })
    );

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warnTimerRef.current);
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, resetTimer)
      );
    };
  }, [isAuthenticated, resetTimer]);
}
