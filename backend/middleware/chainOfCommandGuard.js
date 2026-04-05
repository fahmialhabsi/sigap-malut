/**
 * chainOfCommandGuard.js — ZERO-TRUST SERVER-SIDE GOVERNANCE ENFORCEMENT
 *
 * SECURITY HISTORY:
 *   Before v2.6: Guards relied on client-supplied body fields:
 *     - sekretaris_disetujui (boolean, body param — trivially spoofable)
 *     - sekretaris_id (body param — trivially spoofable)
 *     - jf_diverifikasi (body param — trivially spoofable)
 *   An attacker could set { sekretaris_disetujui: true, sekretaris_id: 1 }
 *   and bypass governance enforcement entirely.
 *
 *   v2.6 fix: ALL guards now query the Task record from the database.
 *   Trusted state = task.status in DB (maintained exclusively by server).
 *   Client body approval fields are IGNORED and REJECTED if present.
 *
 * USAGE:
 *   router.post('/:id/forward-to-kadin', protect, requireSekretarisBeforeKadin, handler);
 *   router.post('/verifikasi/:id/kirim-kabid', protect, requireJFBeforeKabid, handler);
 *
 *   The middleware reads :id from req.params.id.
 *   task_id in body is NOT trusted.
 */

import Task from "../models/Task.js";

const CHAIN_BIDANG = ["pelaksana", "jabatan_fungsional", "kepala_bidang", "sekretaris", "kepala_dinas"];

/**
 * requireJFBeforeKabid
 *
 * Verifies that a task has been verified by JF (Jabatan Fungsional)
 * before it can proceed to Kepala Bidang.
 *
 * Trusted evidence: task.status in DB must be 'verified' or beyond.
 * Statuses that prove JF verification: verified, approved_by_secretary, forwarded_to_kadin.
 *
 * ZERO TRUST: Ignores req.body.jf_diverifikasi / req.body.jf_id entirely.
 */
export async function requireJFBeforeKabid(req, res, next) {
  const taskId = req.params.id;
  if (!taskId) {
    return res.status(400).json({
      error: "missing_task_id",
      message: "task id wajib ada di URL params (:id) untuk validasi governance.",
    });
  }

  let task;
  try {
    task = await Task.findByPk(taskId, { attributes: ["id", "status"] });
  } catch (err) {
    return res.status(500).json({ error: "db_error", message: "Gagal validasi status task." });
  }

  if (!task) {
    return res.status(404).json({ error: "task_not_found", message: "Task tidak ditemukan." });
  }

  const JF_VERIFIED_STATUSES = ["verified", "approved_by_secretary", "forwarded_to_kadin", "closed"];
  if (!JF_VERIFIED_STATUSES.includes(task.status)) {
    return res.status(422).json({
      error: "chain_of_command_violation",
      code: "BYPASS_JF",
      current_status: task.status,
      message: `Dokumen harus melalui verifikasi Jabatan Fungsional terlebih dahulu. Status saat ini: '${task.status}'. Status wajib sebelum ke Kepala Bidang: ${JF_VERIFIED_STATUSES.join(", ")}.`,
    });
  }

  return next();
}

/**
 * blockDirectSubmitToKabid
 *
 * Blocks pelaksana from submitting directly to Kepala Bidang endpoint.
 * This is a ROLE-BASED check (user.role from JWT, trusted), not body-based.
 * Does NOT trust body parameters.
 */
export function blockDirectSubmitToKabid(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "unauthenticated" });

  const role = String(user.role || "").toLowerCase();
  const isPelaksana = role.includes("pelaksana") || role.includes("staf");

  if (isPelaksana) {
    const targetEndpoint = req.originalUrl || "";
    if (targetEndpoint.includes("kabid") || targetEndpoint.includes("kepala-bidang")) {
      return res.status(403).json({
        error: "forbidden",
        code: "CHAIN_OF_COMMAND_VIOLATION",
        message: "Pelaksana tidak dapat langsung mengajukan ke Kepala Bidang. Kirim ke Jabatan Fungsional terlebih dahulu.",
      });
    }
  }

  return next();
}

/**
 * requireSekretarisBeforeKadin
 *
 * Verifies that a task has been formally approved by Sekretaris
 * before it can be forwarded to or acted upon by Kepala Dinas.
 *
 * Trusted evidence: task.status in DB must be 'approved_by_secretary' or beyond.
 *
 * ZERO TRUST:
 *   - Does NOT read req.body.sekretaris_disetujui
 *   - Does NOT read req.body.sekretaris_id
 *   - These body fields are now ignored. If a client sends them, they have no effect.
 */
export async function requireSekretarisBeforeKadin(req, res, next) {
  const taskId = req.params.id;
  if (!taskId) {
    return res.status(400).json({
      error: "missing_task_id",
      message: "task id wajib ada di URL params (:id) untuk validasi governance.",
    });
  }

  let task;
  try {
    task = await Task.findByPk(taskId, { attributes: ["id", "status"] });
  } catch (err) {
    return res.status(500).json({ error: "db_error", message: "Gagal validasi status task." });
  }

  if (!task) {
    return res.status(404).json({ error: "task_not_found", message: "Task tidak ditemukan." });
  }

  const SEKRETARIS_APPROVED_STATUSES = ["approved_by_secretary", "forwarded_to_kadin", "closed"];
  if (!SEKRETARIS_APPROVED_STATUSES.includes(task.status)) {
    return res.status(422).json({
      error: "chain_of_command_violation",
      code: "BYPASS_SEKRETARIS",
      current_status: task.status,
      message: `Dokumen formal harus melewati persetujuan Sekretaris terlebih dahulu. Status saat ini: '${task.status}'. Status wajib: ${SEKRETARIS_APPROVED_STATUSES.join(", ")}.`,
    });
  }

  return next();
}
