/**
 * LiveKPIBadge.jsx
 *
 * Komponen indikator real-time yang menampilkan:
 *  - Status koneksi WebSocket (hijau = live, kuning = polling, merah = offline)
 *  - KPI terbaru yang diterima via WS atau polling
 *  - Waktu pengambilan data terakhir
 *
 * Penggunaan:
 *   <LiveKPIBadge type="inflasi" />
 */

import { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";
import useKPIPolling from "../../hooks/useKPIPolling";

const STATUS_CONFIG = {
  live: {
    dot: "bg-green-400 animate-pulse",
    label: "LIVE",
    labelClass: "text-green-700 bg-green-50 border-green-200",
    title: "Real-time via WebSocket",
  },
  polling: {
    dot: "bg-yellow-400",
    label: "5 menit",
    labelClass: "text-yellow-700 bg-yellow-50 border-yellow-200",
    title: "Polling setiap 5 menit",
  },
  offline: {
    dot: "bg-red-400",
    label: "Offline",
    labelClass: "text-red-700 bg-red-50 border-red-200",
    title: "Tidak terhubung",
  },
};

/**
 * @param {{ type?: "inflasi"|"ketersediaan"|"distribusi", className?: string }} props
 */
export default function LiveKPIBadge({ type = "inflasi", className = "" }) {
  const { connected } = useSocket();
  const { lastUpdated } = useKPIPolling(type);
  const [timeAgo, setTimeAgo] = useState("");

  const status = connected ? "live" : lastUpdated ? "polling" : "offline";
  const { dot, label, labelClass, title } = STATUS_CONFIG[status];

  // Update "waktu lalu" setiap 10 detik
  useEffect(() => {
    function update() {
      if (!lastUpdated) {
        setTimeAgo("");
        return;
      }
      const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secs < 60) setTimeAgo(`${secs}d lalu`);
      else if (secs < 3600) setTimeAgo(`${Math.floor(secs / 60)}m lalu`);
      else setTimeAgo(`${Math.floor(secs / 3600)}j lalu`);
    }
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${labelClass} ${className}`}
      title={title}
    >
      <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
      <span>{label}</span>
      {timeAgo && <span className="opacity-60 font-normal">· {timeAgo}</span>}
    </div>
  );
}
