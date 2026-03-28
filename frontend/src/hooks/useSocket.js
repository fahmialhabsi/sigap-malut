/**
 * useSocket.js
 *
 * React hook untuk koneksi Socket.IO ke backend SIGAP MALUT.
 * Fitur:
 *  - Auto-connect dengan JWT token dari authStore
 *  - Auto-reconnect dengan exponential backoff
 *  - Subscribe/unsubscribe ke events
 *  - Expose connection status (connected, connecting, error)
 *
 * Penggunaan:
 *   const { connected, on, off, emit } = useSocket();
 *   useEffect(() => {
 *     on("kpi:update", handler);
 *     return () => off("kpi:update", handler);
 *   }, [on, off]);
 */

import { useEffect, useRef, useState, useCallback } from "react";
import useAuthStore from "../stores/authStore";

const SOCKET_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.VITE_API_URL) ||
  "http://localhost:5000";

// Pola reconnect: 1s, 2s, 4s, 8s, max 30s
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 30000];

let _sharedSocket = null;
let _refCount = 0;

export default function useSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;
    let reconnectTimer = null;
    let attempt = 0;

    async function setupSocket() {
      if (!active) return;
      if (socketRef.current && socketRef.current.connected) return;

      try {
        const { io } = await import("socket.io-client");
        if (!active) return;

        const socket = io(SOCKET_URL, {
          auth: { token: token || "" },
          transports: ["websocket", "polling"],
          reconnection: false,
          timeout: 10000,
        });

        socket.on("connect", () => {
          if (!active) return;
          setConnected(true);
          setError(null);
          attempt = 0;
        });

        socket.on("disconnect", (reason) => {
          if (!active) return;
          setConnected(false);
          if (reason === "io client disconnect") return;
          const delay =
            RECONNECT_DELAYS[Math.min(attempt, RECONNECT_DELAYS.length - 1)];
          attempt++;
          reconnectTimer = setTimeout(() => setupSocket(), delay);
        });

        socket.on("connect_error", (err) => {
          if (!active) return;
          setError(err.message);
        });

        socketRef.current = socket;
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    setupSocket();

    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [isAuthenticated, token]);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { connected, error, on, off, emit };
}
