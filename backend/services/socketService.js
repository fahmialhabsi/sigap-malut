/**
 * socketService.js
 *
 * Singleton Socket.IO instance manager untuk SIGAP MALUT.
 * Mendukung:
 *  - Room-based emit (per dashboard type)
 *  - KPI live broadcast
 *  - Alert push ke semua client yang terhubung
 *  - JWT-based connection authentication
 */

import jwt from "jsonwebtoken";

let _io = null;

// ── Room names ────────────────────────────────────────────────────────────────
export const ROOMS = {
  KPI_INFLASI: "kpi:inflasi",
  KPI_KETERSEDIAAN: "kpi:ketersediaan",
  KPI_DISTRIBUSI: "kpi:distribusi",
  KPI_KONSUMSI: "kpi:konsumsi",
  KPI_KASUBAG: "kpi:kasubag",
  KPI_UPTD: "kpi:uptd",
  ALERTS: "alerts:all",
  NOTIFICATIONS: "notifications",
};

// ── Events ────────────────────────────────────────────────────────────────────
export const EVENTS = {
  KPI_UPDATE: "kpi:update",
  ALERT_NEW: "alert:new",
  NOTIFICATION_NEW: "notification:new",
  CONNECT: "connection",
  DISCONNECT: "disconnect",
};

/**
 * Initialize Socket.IO dengan http.Server yang sudah ada.
 * Alias untuk initSocketIOAsync — hanya untuk backward compatibility.
 */

// Lazy-initialized karena socket.io adalah dynamic import di ESM
async function _lazyInit_internal(httpServer) {
  const { Server } = await import("socket.io");

  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      // Allow unauthenticated for public dashboard rooms
      socket.userRole = "guest";
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "sigap-secret",
      );
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      socket.userRole = "guest";
      next();
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on(EVENTS.CONNECT, (socket) => {
    console.log(
      `[WS] Client connected: ${socket.id} (role: ${socket.userRole || "guest"})`,
    );

    // Auto-join rooms berdasarkan role
    socket.join(ROOMS.ALERTS);
    socket.join(ROOMS.KPI_INFLASI);
    socket.join(ROOMS.KPI_KETERSEDIAAN);
    socket.join(ROOMS.KPI_DISTRIBUSI);
    socket.join(ROOMS.KPI_KONSUMSI);
    socket.join(ROOMS.KPI_KASUBAG);
    socket.join(ROOMS.KPI_UPTD);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Client bisa meminta join room tertentu
    socket.on("join:room", (room) => {
      if (Object.values(ROOMS).includes(room)) {
        socket.join(room);
      }
    });

    socket.on(EVENTS.DISCONNECT, () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  _io = io;
  console.log("[WS] Socket.IO initialized ✓");
  return io;
}

/**
 * Get the shared io instance.
 * Returns null if initSocketIO() hasn't been called yet.
 */
export function getIO() {
  return _io;
}

/**
 * Broadcast KPI update ke semua client di room tertentu.
 * @param {string} room   - ROOMS.KPI_INFLASI, dll.
 * @param {object} data   - payload { periode, kpiList, timestamp }
 */
export function broadcastKPI(room, data) {
  if (!_io) return;
  _io.to(room).emit(EVENTS.KPI_UPDATE, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Push alert ke semua client.
 * @param {object} alert  - { id, title, message, severity, module }
 */
export function pushAlert(alert) {
  if (!_io) return;
  _io.to(ROOMS.ALERTS).emit(EVENTS.ALERT_NEW, {
    ...alert,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Push notifikasi ke user tertentu.
 * @param {number|string} userId
 * @param {object} notification
 */
export function pushNotificationToUser(userId, notification) {
  if (!_io || !userId) return;
  _io.to(`user:${userId}`).emit(EVENTS.NOTIFICATION_NEW, {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Hitung jumlah client yang terkoneksi.
 */
export function getConnectedCount() {
  if (!_io) return 0;
  return _io.engine?.clientsCount ?? 0;
}

// Export init function (sync wrapper that returns a Promise)
export async function initSocketIOAsync(httpServer) {
  return _lazyInit_internal(httpServer);
}

export default {
  initSocketIOAsync,
  getIO,
  broadcastKPI,
  pushAlert,
  pushNotificationToUser,
  getConnectedCount,
  ROOMS,
  EVENTS,
};
