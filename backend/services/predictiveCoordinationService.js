import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import { isHCoordTerminalStatus } from "./horizontalCoordinationStateMachine.js";

/**
 * Sinyal prediktif sederhana (heuristik) untuk koordinasi horizontal & risiko tunda.
 */
export async function buildPredictiveCoordinationSnapshot(threadId) {
  const t = String(threadId);
  const rows = await HorizontalCoordinationRequest.findAll({
    where: { execution_thread_id: t },
    attributes: [
      "id",
      "status",
      "sla_due_at",
      "coordination_kind",
      "created_at",
      "to_user_id",
    ],
    order: [["created_at", "DESC"]],
    limit: 200,
  });

  const now = Date.now();
  let open = 0;
  let slaOverdue = 0;
  for (const r of rows) {
    const st = String(r.status || "");
    if (isHCoordTerminalStatus(st)) continue;
    open += 1;
    const due = r.sla_due_at ? new Date(r.sla_due_at).getTime() : null;
    if (due != null && due < now) slaOverdue += 1;
  }

  let coordination_delay_risk = "low";
  if (slaOverdue >= 2) coordination_delay_risk = "high";
  else if (slaOverdue === 1 || open >= 4) coordination_delay_risk = "medium";

  return {
    open_horizontal_items: open,
    horizontal_sla_overdue: slaOverdue,
    coordination_delay_risk,
    predicted_next_bottleneck:
      slaOverdue > 0 ? "horizontal_coordination_sla" : open >= 6 ? "coordination_queue" : null,
    model: "heuristic_v1",
  };
}
