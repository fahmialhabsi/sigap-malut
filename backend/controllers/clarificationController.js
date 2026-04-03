import { Op } from "sequelize";
import ClarificationThread from "../models/ClarificationThread.js";
import ClarificationMessage from "../models/ClarificationMessage.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import {
  assertLaneMatchesAnchor,
  resolveParticipantUserIds,
  ANCHOR,
  CLARIFICATION_LANES,
} from "../services/clarificationParticipantService.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import { NotifikasiGubernur } from "../models/index.js";
import { getIO, ROOMS } from "../services/socketService.js";
import { resolveClarificationExecutionThreadId } from "../services/executionThreadService.js";

function ensureTaskAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

// GET /api/clarification/threads?anchor_type=&anchor_id=&lane=
export async function listThreads(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, error: "unauthenticated" });

    const anchor_type = String(req.query.anchor_type || "");
    const anchor_id = Number(req.query.anchor_id);
    const lane = String(req.query.lane || "");

    if (!anchor_type || !Number.isFinite(anchor_id) || !lane) {
      return res.status(400).json({ success: false, message: "anchor_type, anchor_id, lane wajib" });
    }

    if (!assertLaneMatchesAnchor(anchor_type, lane)) {
      return res.status(400).json({ success: false, message: "lane tidak cocok dengan anchor" });
    }

    const participants = await resolveParticipantUserIds(anchor_type, anchor_id);
    if (!participants.includes(uid)) {
      return res.status(403).json({ success: false, message: "Akses diskusi ditolak" });
    }

    const thread = await ClarificationThread.findOne({
      where: { anchor_type, anchor_id, lane },
    });

    if (!thread) {
      return res.json({ success: true, data: null, messages: [] });
    }

    if (!thread.execution_thread_id) {
      const tid = await resolveClarificationExecutionThreadId(
        anchor_type,
        anchor_id,
      );
      await thread.update({ execution_thread_id: tid });
    }

    const messages = await ClarificationMessage.findAll({
      where: { thread_id: thread.id },
      order: [["created_at", "ASC"]],
      limit: 200,
    });

    const authors = await User.findAll({
      where: { id: { [Op.in]: [...new Set(messages.map((m) => m.author_id))] } },
      attributes: ["id", "nama_lengkap", "username", "role"],
    }).catch(() => []);
    const byId = Object.fromEntries(authors.map((u) => [u.id, u]));

    return res.json({
      success: true,
      data: thread,
      messages: messages.map((m) => ({
        ...m.toJSON(),
        author: byId[m.author_id] || null,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/clarification/threads  { anchor_type, anchor_id, lane, subject? }
export async function getOrCreateThread(req, res) {
  try {
    ensureTaskAssoc();
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, error: "unauthenticated" });

    const { anchor_type, anchor_id, lane, subject } = req.body || {};
    const at = String(anchor_type || "");
    const aid = Number(anchor_id);
    const ln = String(lane || "");

    if (!at || !Number.isFinite(aid) || !ln) {
      return res.status(400).json({ success: false, message: "anchor_type, anchor_id, lane wajib" });
    }

    if (!assertLaneMatchesAnchor(at, ln)) {
      return res.status(400).json({ success: false, message: "lane tidak cocok dengan anchor" });
    }

    const participants = await resolveParticipantUserIds(at, aid);
    if (!participants.includes(uid)) {
      return res.status(403).json({ success: false, message: "Akses diskusi ditolak" });
    }

    const [thread] = await ClarificationThread.findOrCreate({
      where: { anchor_type: at, anchor_id: aid, lane: ln },
      defaults: {
        subject: subject ? String(subject).slice(0, 255) : null,
        participant_user_ids: participants,
        created_by: uid,
      },
    });

    const tid = await resolveClarificationExecutionThreadId(at, aid);
    if (thread.execution_thread_id !== tid) {
      await thread.update({ execution_thread_id: tid });
    }

    if (!thread.participant_user_ids?.length) {
      thread.participant_user_ids = participants;
      await thread.save();
    }

    const messages = await ClarificationMessage.findAll({
      where: { thread_id: thread.id },
      order: [["created_at", "ASC"]],
      limit: 200,
    });

    return res.json({ success: true, data: thread, messages });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/clarification/threads/:id/messages { body }
export async function postMessage(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, error: "unauthenticated" });

    const thread = await ClarificationThread.findByPk(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: "Thread tidak ditemukan" });

    const ids = Array.isArray(thread.participant_user_ids)
      ? thread.participant_user_ids
      : [];
    if (!ids.includes(uid)) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    const body = String(req.body?.body || "").trim();
    if (!body) return res.status(400).json({ success: false, message: "Isi pesan wajib" });

    const msg = await ClarificationMessage.create({
      thread_id: thread.id,
      author_id: uid,
      body: body.slice(0, 20000),
    });

    await thread.update({ updated_at: new Date() });

    if (
      thread.lane === CLARIFICATION_LANES.GUBERNUR_KADIN &&
      thread.anchor_type === ANCHOR.INSTRUKSI_GUBERNUR
    ) {
      const ig = await InstruksiGubernur.findByPk(thread.anchor_id);
      const io = getIO();
      if (ig) {
        if (uid === ig.assigned_to) {
          await NotifikasiGubernur.create({
            user_id: ig.created_by,
            jenis: "laporan_tersedia",
            judul: "Klarifikasi dari Kepala Dinas",
            isi: body.slice(0, 500),
            referensi_id: ig.id,
            referensi_tabel: "instruksi_gubernur",
            sudah_dibaca: false,
          }).catch(() => null);
          io?.to(ROOMS.GUBERNUR).emit("clarification:baru", {
            instruksiId: ig.id,
            threadId: thread.id,
          });
        } else if (uid === ig.created_by) {
          io?.to(ROOMS.KADIN).emit("clarification:baru", {
            instruksiId: ig.id,
            threadId: thread.id,
          });
        }
      }
    }

    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export { ANCHOR };
