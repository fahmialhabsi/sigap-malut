import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";
import { userCanAccessExecutionThread } from "../services/executionThreadAccessService.js";
import {
  normalizeHCoordStatus,
  validateHCoordPatchTransition,
  validateHCoordRespondTransition,
  HCOORD_TERMINAL_STATUSES,
} from "../services/horizontalCoordinationStateMachine.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function listHorizontalByThread(req, res) {
  try {
    const threadId = String(req.params.threadId || "").trim();
    if (!threadId || !UUID_RE.test(threadId)) {
      return res.status(400).json({
        success: false,
        message: "execution_thread_id tidak valid (UUID).",
      });
    }
    const ok = await userCanAccessExecutionThread(req.user, threadId);
    if (!ok) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak untuk thread ini.",
      });
    }
    const rows = await HorizontalCoordinationRequest.findAll({
      where: { execution_thread_id: threadId },
      order: [["created_at", "DESC"]],
      limit: 200,
    });
    return res.json({ success: true, data: rows.map((r) => r.toJSON()) });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat koordinasi horizontal",
      error: err.message,
    });
  }
}

export async function createHorizontalCoordination(req, res) {
  try {
    const {
      execution_thread_id,
      coordination_kind,
      subject,
      body: bodyText,
      to_user_id,
      to_unit,
      from_org_level,
      to_org_level,
      sla_hours,
      surat_masuk_id,
      task_id,
    } = req.body || {};

    const tid = String(execution_thread_id || "").trim();
    if (!tid || !UUID_RE.test(tid)) {
      return res.status(400).json({
        success: false,
        code: "THREAD_WAJIB",
        message: "execution_thread_id (UUID) wajib untuk koordinasi horizontal pada thread yang sama.",
      });
    }
    const ok = await userCanAccessExecutionThread(req.user, tid);
    if (!ok) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak untuk thread ini.",
      });
    }

    let slaDue = null;
    const hrs = sla_hours != null ? Number(sla_hours) : null;
    if (Number.isFinite(hrs) && hrs > 0) {
      slaDue = new Date(Date.now() + hrs * 3600000);
    }

    const row = await HorizontalCoordinationRequest.create({
      execution_thread_id: tid,
      coordination_kind: coordination_kind || "sync_request",
      subject: subject || null,
      body: bodyText || null,
      from_user_id: req.user.id,
      to_user_id: to_user_id != null && Number.isFinite(Number(to_user_id)) ? Number(to_user_id) : null,
      from_unit: req.user.unit_kerja || null,
      to_unit: to_unit || null,
      from_org_level: from_org_level || "sekretaris",
      to_org_level: to_org_level || "kabid",
      status: "diajukan",
      sla_due_at: slaDue,
      surat_masuk_id:
        surat_masuk_id != null && Number.isFinite(Number(surat_masuk_id))
          ? Number(surat_masuk_id)
          : null,
      task_id: task_id != null && Number.isFinite(Number(task_id)) ? Number(task_id) : null,
    });

    await ExecutionThreadEvent.create({
      execution_thread_id: tid,
      event_type: "horizontal_coordination_created",
      ref_modul: "horizontal_coordination_requests",
      ref_id: String(row.id),
      payload: {
        coordination_kind: row.coordination_kind,
        to_user_id: row.to_user_id,
      },
      actor_id: req.user.id,
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, data: row.toJSON() });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat koordinasi horizontal",
      error: err.message,
    });
  }
}

export async function updateHorizontalCoordinationStatus(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid." });
    }
    const row = await HorizontalCoordinationRequest.findByPk(id);
    if (!row) {
      return res.status(404).json({
        success: false,
        code: "KOORDINASI_TIDAK_DITEMUKAN",
        message: "Item koordinasi tidak ditemukan.",
      });
    }
    const tid = String(row.execution_thread_id || "");
    const ok = await userCanAccessExecutionThread(req.user, tid);
    if (!ok) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }
    const uid = Number(req.user.id);
    const role = String(req.user.role || "").toLowerCase();
    const isSuper = role.includes("super_admin");
    const isSek = role.includes("sekretaris");
    const touches =
      Number(row.from_user_id) === uid ||
      Number(row.to_user_id) === uid ||
      (isSek && row.to_user_id == null);
    if (!touches && !isSuper) {
      return res.status(403).json({
        success: false,
        code: "HCOORD_FORBIDDEN_ACTOR",
        message: "Hanya pihak terkait koordinasi yang dapat mengubah status.",
      });
    }
    const next = normalizeHCoordStatus(req.body?.status);
    const v = validateHCoordPatchTransition(row.status, next);
    if (!v.ok) {
      return res.status(400).json({
        success: false,
        code: v.code,
        message: v.message,
        validation: {
          from_status: v.from_status,
          to_status: v.to_status,
          allowed_to: v.allowed_to,
        },
      });
    }
    await row.update({ status: next });
    await ExecutionThreadEvent.create({
      execution_thread_id: tid,
      event_type: "horizontal_coordination_status_changed",
      ref_modul: "horizontal_coordination_requests",
      ref_id: String(row.id),
      payload: { status: next, actor_user_id: uid },
      actor_id: uid,
      created_at: new Date(),
    });
    await row.reload();
    return res.json({ success: true, data: row.toJSON() });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status koordinasi",
      error: err.message,
    });
  }
}

export async function respondHorizontalCoordination(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID tidak valid." });
    }
    const row = await HorizontalCoordinationRequest.findByPk(id);
    if (!row) {
      return res.status(404).json({
        success: false,
        code: "KOORDINASI_TIDAK_DITEMUKAN",
        message: "Item koordinasi tidak ditemukan.",
      });
    }
    const tid = String(row.execution_thread_id || "");
    const ok = await userCanAccessExecutionThread(req.user, tid);
    if (!ok) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    const uid = req.user.id;
    const toUid = row.to_user_id;
    const role = String(req.user.role || "").toLowerCase();
    const isSuper = role.includes("super_admin");
    const isRecipient = toUid == null || Number(toUid) === Number(uid);
    if (!isRecipient && !isSuper) {
      return res.status(403).json({
        success: false,
        code: "HCOORD_FORBIDDEN_ACTOR",
        message: "Hanya penerima yang dituju atau admin yang dapat membalas.",
      });
    }

    const requested = normalizeHCoordStatus(req.body?.status) || "selesai";
    const finalStatus = HCOORD_TERMINAL_STATUSES.includes(requested) ? requested : "selesai";
    const vr = validateHCoordRespondTransition(row.status, finalStatus);
    if (!vr.ok) {
      return res.status(400).json({
        success: false,
        code: vr.code,
        message: vr.message,
        validation: { from_status: vr.from_status, to_status: vr.to_status },
      });
    }
    await row.update({
      status: finalStatus,
      response_body: req.body?.response_body != null ? String(req.body.response_body) : null,
      responded_at: new Date(),
      responded_by_user_id: uid,
    });

    await ExecutionThreadEvent.create({
      execution_thread_id: tid,
      event_type: "horizontal_coordination_responded",
      ref_modul: "horizontal_coordination_requests",
      ref_id: String(row.id),
      payload: { status: finalStatus },
      actor_id: uid,
      created_at: new Date(),
    });

    await row.reload();
    return res.json({ success: true, data: row.toJSON() });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui koordinasi",
      error: err.message,
    });
  }
}
