import { Op } from "sequelize";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import { evaluateExecutionThreadHealth } from "./executionThreadHealthService.js";
import { enqueueSocketDelivery } from "./notificationOutboxService.js";
import { ROOMS } from "./socketService.js";

/**
 * Pindai thread instruksi terbaru; jika health kritis, antre notifikasi ke ruang Gubernur & Kadis.
 */
export async function runSystemicThreadAlertsScan({ limit = 30 } = {}) {
  const rows = await InstruksiGubernur.findAll({
    where: { execution_thread_id: { [Op.ne]: null } },
    order: [["updated_at", "DESC"]],
    limit,
    attributes: ["id", "judul", "execution_thread_id", "nomor_instruksi"],
  });

  const day = new Date().toISOString().slice(0, 10);
  let alerts_enqueued = 0;

  for (const r of rows) {
    const tid = String(r.execution_thread_id || "");
    if (!tid) continue;
    const health = await evaluateExecutionThreadHealth(tid);
    if (health.status !== "critical") continue;

    const base = {
      execution_thread_id: tid,
      instruksi_id: r.id,
      judul: r.judul,
      nomor_instruksi: r.nomor_instruksi,
      thread_health: health,
    };

    await enqueueSocketDelivery({
      eventKey: `sysalert|gov|${tid}|${day}`,
      room: ROOMS.GUBERNUR,
      event: "execution:thread:systemic_alert",
      data: base,
    }).catch(() => null);

    await enqueueSocketDelivery({
      eventKey: `sysalert|kad|${tid}|${day}`,
      room: ROOMS.KADIN,
      event: "execution:thread:systemic_alert",
      data: base,
    }).catch(() => null);

    alerts_enqueued += 1;
  }

  return { scanned: rows.length, alerts_enqueued };
}
