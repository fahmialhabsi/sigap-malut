/**
 * socketService.js
 */

import jwt from "jsonwebtoken";

let _io = null;

export const ROOMS = {
  KPI_INFLASI: "kpi:inflasi",
  KPI_KETERSEDIAAN: "kpi:ketersediaan",
  KPI_DISTRIBUSI: "kpi:distribusi",
  GUBERNUR: "gubernur:dashboard",
  SEKRETARIS: "sekretaris:dashboard",
  KADIN: "kadin:dashboard",
  KASUBAG: "kasubag:queue",
  JF: "jf:approval",
  ALERTS: "alerts:all",
  NOTIFICATIONS: "notifications",
};

export const EVENTS = {
  KPI_UPDATE: "kpi:update",
  ALERT_NEW: "alert:new",
  NOTIFICATION_NEW: "notification:new",
  CONNECT: "connection",
  DISCONNECT: "disconnect",
};

async function lazyInit_internal(httpServer) {
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
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
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

  io.on(EVENTS.CONNECT, (socket) => {
    console.log(
      `[WS] Client connected: ${socket.id} (role: ${
        socket.userRole || "guest"
      })`,
    );

    socket.join(ROOMS.ALERTS);
    socket.join(ROOMS.KPI_INFLASI);
    socket.join(ROOMS.KPI_KETERSEDIAAN);
    socket.join(ROOMS.KPI_DISTRIBUSI);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    const r = String(socket.userRole || "").toLowerCase();
    if (r === "gubernur") {
      socket.join(ROOMS.GUBERNUR);
    }
    if (r === "kepala_dinas") {
      socket.join(ROOMS.KADIN);
    }
    if (r === "sekretaris" || r === "super_admin" || r === "kepala_dinas") {
      socket.join(ROOMS.SEKRETARIS);
    }
  });

  _io = io;
  console.log("[WS] Socket.IO initialized ✓");
  return io;
}

export async function initSocketIOAsync(httpServer) {
  return lazyInit_internal(httpServer);
}

export function getIO() {
  return _io;
}

export function broadcastKPI(room, payload) {
  if (!_io) {
    console.warn("[WS] broadcastKPI called before IO initialized");
    return;
  }

  _io.to(room).emit(EVENTS.KPI_UPDATE, payload);
}

/** Notifikasi Sekretaris: surat masuk baru dari unggahan staf (e-Office). */
export function emitSuratMasukBaru(payload) {
  if (!_io) return;
  _io.to(ROOMS.SEKRETARIS).emit(EVENTS.NOTIFICATION_NEW, {
    kind: "surat_masuk_baru",
    ...payload,
  });
}

export default {
  initSocketIOAsync,
  getIO,
  ROOMS,
  EVENTS,
  broadcastKPI,
  emitSuratMasukBaru,
};
