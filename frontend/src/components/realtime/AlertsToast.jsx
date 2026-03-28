/**
 * AlertsToast.jsx
 *
 * Komponen yang mendengarkan event "alert:new" dari WebSocket
 * dan menampilkan toast notifikasi real-time.
 *
 * Mount sekali di App.jsx atau DashboardLayout.
 *
 * Penggunaan:
 *   <AlertsToast />
 */

import { useEffect } from "react";
import toast from "react-hot-toast";
import useSocket from "../../hooks/useSocket";

const SEVERITY_CONFIG = {
  critical: { icon: "🔴", bg: "bg-red-600", duration: 0 },
  warning: { icon: "🟡", bg: "bg-yellow-500", duration: 8000 },
  info: { icon: "🔵", bg: "bg-blue-500", duration: 5000 },
};

export default function AlertsToast() {
  const { on, off } = useSocket();

  useEffect(() => {
    const handleAlert = (alert) => {
      const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;

      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <span className="text-xl">{cfg.icon}</span>
            <div>
              <div className="font-semibold text-sm">{alert.title}</div>
              <div className="text-xs text-slate-600">{alert.message}</div>
              {alert.module && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Modul: {alert.module}
                </div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ),
        {
          duration: cfg.duration,
          position: "top-right",
          style: { maxWidth: "400px" },
        },
      );
    };

    on("alert:new", handleAlert);
    return () => off("alert:new", handleAlert);
  }, [on, off]);

  // Komponen ini tidak merender UI sendiri — hanya mengaktifkan listener
  return null;
}
