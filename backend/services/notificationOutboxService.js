import { Op } from "sequelize";
import NotificationOutbox from "../models/NotificationOutbox.js";
import { getIO } from "./socketService.js";

const RETRY_MINUTES = [1, 5, 30, 360];

/**
 * Antrekan pengiriman socket (retry jika IO belum siap / gagal).
 */
export async function enqueueSocketDelivery({ eventKey, room, event, data }) {
  if (!eventKey || !room || !event) return null;
  try {
    return await NotificationOutbox.create({
      event_key: eventKey,
      channel: "SOCKET",
      payload: { room, event, data: data || {} },
      status: "pending",
      attempts: 0,
      next_retry_at: new Date(),
    });
  } catch (e) {
    if (e?.name === "SequelizeUniqueConstraintError") return null;
    throw e;
  }
}

async function deliverSocketPayload(payload) {
  const io = getIO();
  if (!io) throw new Error("Socket.IO tidak tersedia");
  const { room, event, data } = payload || {};
  io.to(room).emit(event, data || {});
}

/**
 * Proses batch outbox (dipanggil cron / interval).
 */
export async function processNotificationOutboxBatch(limit = 50) {
  const now = new Date();
  const rows = await NotificationOutbox.findAll({
    where: {
      status: "pending",
      [Op.or]: [{ next_retry_at: null }, { next_retry_at: { [Op.lte]: now } }],
    },
    order: [["id", "ASC"]],
    limit,
  });

  let ok = 0;
  let fail = 0;
  for (const row of rows) {
    try {
      if (row.channel === "SOCKET") {
        await deliverSocketPayload(row.payload);
      }
      await row.update({
        status: "sent",
        last_error: null,
        updated_at: new Date(),
      });
      ok += 1;
    } catch (err) {
      const attempts = Number(row.attempts || 0) + 1;
      const idx = Math.min(attempts - 1, RETRY_MINUTES.length - 1);
      const delayMs = RETRY_MINUTES[idx] * 60 * 1000;
      const next = new Date(Date.now() + delayMs);
      const terminal = attempts >= 8;
      await row.update({
        status: terminal ? "failed" : "pending",
        attempts,
        next_retry_at: terminal ? null : next,
        last_error: String(err?.message || err).slice(0, 2000),
        updated_at: new Date(),
      });
      fail += 1;
    }
  }
  return { processed: rows.length, sent: ok, failed_or_retry: fail };
}
