import { randomUUID } from "crypto";
import Task from "../models/Task.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";

/**
 * Tentukan execution_thread_id untuk task baru: ikut instruksi, induk task, atau root baru.
 */
export async function resolveExecutionThreadIdForTask(task, options = {}) {
  const transaction = options.transaction;
  const existing = task.getDataValue?.("execution_thread_id") ?? task.execution_thread_id;
  if (existing) return existing;

  const meta = task.metadata || {};
  const sid = meta.sumber_instruksi_gubernur_id;
  if (sid != null && Number(sid) > 0) {
    const ig = await InstruksiGubernur.findByPk(Number(sid), { transaction });
    if (ig?.execution_thread_id) return ig.execution_thread_id;
    if (ig) {
      const u = randomUUID();
      await ig.update({ execution_thread_id: u }, { transaction });
      return u;
    }
  }

  const parentId = task.sumber_perintah_kadin;
  if (parentId != null && Number(parentId) > 0) {
    const parent = await Task.findByPk(Number(parentId), { transaction });
    if (!parent) {
      throw new Error("INDUK_TASK_TIDAK_DITEMUKAN");
    }
    let ptid = parent.execution_thread_id;
    if (!ptid) {
      ptid = await resolveExecutionThreadIdForTask(parent, options);
      await parent.update({ execution_thread_id: ptid }, { transaction });
    }
    return ptid;
  }

  return randomUUID();
}

export async function resolvePengajuanExecutionThreadId(instruksi_id, options = {}) {
  const transaction = options.transaction;
  if (instruksi_id != null && Number(instruksi_id) > 0) {
    const ig = await InstruksiGubernur.findByPk(Number(instruksi_id), {
      transaction,
    });
    if (ig?.execution_thread_id) return ig.execution_thread_id;
    if (ig) {
      const u = randomUUID();
      await ig.update({ execution_thread_id: u }, { transaction });
      return u;
    }
  }
  return randomUUID();
}

/** Thread untuk baris clarification_threads dari anchor instruksi / task. */
export async function resolveClarificationExecutionThreadId(
  anchor_type,
  anchor_id,
  options = {},
) {
  const transaction = options.transaction;
  const at = String(anchor_type || "");
  const aid = Number(anchor_id);
  if (at === "instruksi_gubernur" && Number.isFinite(aid)) {
    const ig = await InstruksiGubernur.findByPk(aid, { transaction });
    if (ig?.execution_thread_id) return ig.execution_thread_id;
    if (ig) {
      const u = randomUUID();
      await ig.update({ execution_thread_id: u }, { transaction });
      return u;
    }
  }
  if (at === "task" && Number.isFinite(aid)) {
    const tk = await Task.findByPk(aid, { transaction });
    if (tk?.execution_thread_id) return tk.execution_thread_id;
    if (tk) {
      const u = await resolveExecutionThreadIdForTask(tk, options);
      await tk.update({ execution_thread_id: u }, { transaction });
      return u;
    }
  }
  return randomUUID();
}

export async function appendExecutionThreadEvent({
  execution_thread_id,
  event_type,
  ref_modul,
  ref_id,
  payload,
  actor_id,
}) {
  if (!execution_thread_id || !event_type) return null;
  return ExecutionThreadEvent.create({
    execution_thread_id,
    event_type,
    ref_modul: ref_modul || null,
    ref_id: ref_id != null ? String(ref_id) : null,
    payload: payload || null,
    actor_id: actor_id || null,
    created_at: new Date(),
  });
}
