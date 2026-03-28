/**
 * useKPIPolling.js
 *
 * React hook untuk polling KPI aggregate setiap 5 menit.
 * Menggunakan WebSocket (Socket.IO) sebagai primary channel.
 * Fallback ke REST polling jika WebSocket tidak terhubung.
 *
 * Penggunaan:
 *   const { kpi, lastUpdated, loading } = useKPIPolling("inflasi");
 */

import { useState, useEffect, useRef, useCallback } from "react";
import useSocket from "./useSocket";
import axiosInstance from "../services/api";

// Sesuai dokumen: 5 menit
const POLL_INTERVAL_MS = 5 * 60 * 1000;

// Map tipe KPI ke endpoint dan event
const KPI_CONFIG = {
  inflasi: {
    endpoint: "/api/inflasi/latest",
    event: "kpi:update",
    filter: (data) => data?.type === "inflasi",
  },
  ketersediaan: {
    endpoint: "/api/komoditas/stock",
    event: "kpi:update",
    filter: (data) => data?.type === "ketersediaan",
  },
  distribusi: {
    endpoint: "/api/dashboard/sekretaris/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "distribusi",
  },
  kasubag: {
    endpoint: "/api/dashboard/kasubag/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "kasubag",
  },
  "kasubag-uptd": {
    endpoint: "/api/dashboard/kasubag-uptd/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "kasubag-uptd",
  },
  "kasi-uptd": {
    endpoint: "/api/dashboard/kasi-uptd/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "kasi-uptd",
  },
  "fungsional-bidang": {
    endpoint: "/api/dashboard/fungsional-bidang/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-bidang",
  },
  "fungsional-ketersediaan": {
    endpoint: "/api/dashboard/fungsional-ketersediaan/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-ketersediaan",
  },
  "fungsional-distribusi": {
    endpoint: "/api/dashboard/fungsional-distribusi/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-distribusi",
  },
  "fungsional-konsumsi": {
    endpoint: "/api/dashboard/fungsional-konsumsi/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-konsumsi",
  },
  "fungsional-uptd-mutu": {
    endpoint: "/api/dashboard/fungsional-uptd-mutu/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-uptd-mutu",
  },
  "fungsional-uptd-teknis": {
    endpoint: "/api/dashboard/fungsional-uptd-teknis/summary",
    event: "kpi:update",
    filter: (data) => data?.type === "fungsional-uptd-teknis",
  },
};

/**
 * @param {"inflasi"|"ketersediaan"|"distribusi"} type
 */
export default function useKPIPolling(type = "inflasi") {
  const [kpi, setKPI] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollTimer = useRef(null);
  const { connected, on, off } = useSocket();
  const config = KPI_CONFIG[type];

  // ── REST fallback fetch ────────────────────────────────────────────────────
  const fetchREST = useCallback(async () => {
    if (!config?.endpoint) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(config.endpoint);
      if (res.data?.success !== false) {
        setKPI(res.data);
        setLastUpdated(new Date());
      }
    } catch {
      // Gagal silently — data lama tetap ditampilkan
    } finally {
      setLoading(false);
    }
  }, [config]);

  // ── WebSocket listener ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!connected || !config) return;

    const handler = (data) => {
      if (config.filter(data)) {
        setKPI(data);
        setLastUpdated(new Date());
      }
    };

    on(config.event, handler);
    return () => off(config.event, handler);
  }, [connected, config, on, off]);

  // ── REST polling sebagai fallback ──────────────────────────────────────────
  useEffect(() => {
    // Fetch sekali langsung
    fetchREST();

    // Bila terkoneksi WS, tidak perlu REST polling agresif
    // Tetap jalankan polling 5 menit sebagai backup
    pollTimer.current = setInterval(fetchREST, POLL_INTERVAL_MS);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [fetchREST]);

  return { kpi, loading, lastUpdated, refetch: fetchREST };
}
