import { resolveOperationalExecutionThread } from "./executionThreadEnforcementService.js";

function applyResolvedToBody(req, resolved) {
  req.body = {
    ...req.body,
    execution_thread_id: resolved.execution_thread_id,
  };
  if (resolved.task_id != null && req.body.task_id == null) {
    req.body.task_id = resolved.task_id;
  }
}

/**
 * Gate untuk POST — 400 jika thread tidak bisa ditentukan.
 */
export async function gateOperationalWrite(req, res) {
  const resolved = await resolveOperationalExecutionThread(req.body || {}, req);
  if (!resolved.ok) {
    res.status(400).json({
      success: false,
      code: resolved.code || "THREAD_WAJIB",
      message: resolved.message,
    });
    return false;
  }
  applyResolvedToBody(req, resolved);
  return true;
}

/**
 * Gate untuk PUT/PATCH — pertahankan thread yang ada; jika belum ada, wajib resolusi seperti create.
 */
export async function gateOperationalUpdate(req, res, record) {
  if (!record) return true;
  const existing =
    record.getDataValue?.("execution_thread_id") ?? record.execution_thread_id ?? null;
  if (existing && String(existing).length > 0) {
    req.body = {
      ...req.body,
      execution_thread_id: req.body.execution_thread_id || existing,
    };
    const tid = record.getDataValue?.("task_id") ?? record.task_id;
    if (tid != null && req.body.task_id == null) {
      req.body.task_id = tid;
    }
    return true;
  }
  return gateOperationalWrite(req, res);
}
