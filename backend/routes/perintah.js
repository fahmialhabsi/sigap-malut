// backend/routes/perintah.js
// Perintah (Command/Instruction) — Sequelize-backed, chain-of-command API

import express from "express";
import { Op } from "sequelize";
import Perintah from "../models/Perintah.js";
import PerintahLog from "../models/PerintahLog.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── Helper: create log entry ───────────────────────────────────────────────
async function addLog(perintah_id, aksi, user, catatan = null, progres_baru = null, lampiran_url = null) {
  return PerintahLog.create({
    perintah_id,
    aksi,
    oleh_user_id: user.id,
    oleh_role: user.role || user.roleName,
    catatan,
    progres_baru,
    lampiran_url,
  });
}

// ── POST /perintah — Buat perintah baru ───────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    const {
      judul, isi, ke_role, ke_user_id, prioritas, deadline,
      lampiran_url, is_rahasia, modul_terkait, perintah_induk_id,
    } = req.body;

    if (!judul || !isi || !ke_role) {
      return res.status(400).json({ error: "judul, isi, dan ke_role wajib diisi" });
    }

    const p = await Perintah.create({
      judul,
      isi,
      dari_role: user.role || user.roleName || "unknown",
      dari_user_id: user.id,
      ke_role,
      ke_user_id: ke_user_id || null,
      prioritas: prioritas || "normal",
      deadline: deadline || null,
      lampiran_url: lampiran_url || null,
      is_rahasia: is_rahasia || false,
      modul_terkait: modul_terkait || null,
      perintah_induk_id: perintah_induk_id || null,
      status: "terkirim",
    });

    await addLog(p.id, "diterima", user, "Perintah dibuat dan dikirim");

    res.status(201).json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /perintah — List (filter by role/status/direction) ────────────────
router.get("/", async (req, res) => {
  try {
    const user = req.user;
    const { arah, status, ke_role, dari_role, limit = 20, offset = 0 } = req.query;

    const where = { deleted_at: null };

    if (arah === "masuk") {
      where[Op.or] = [
        { ke_user_id: user.id },
        { ke_role: user.role || user.roleName, ke_user_id: null },
      ];
    } else if (arah === "keluar") {
      where.dari_user_id = user.id;
    } else {
      // Default: semua yang relevan dengan user
      where[Op.or] = [
        { dari_user_id: user.id },
        { ke_user_id: user.id },
        { ke_role: user.role || user.roleName, ke_user_id: null },
      ];
    }

    if (status) where.status = status;
    if (ke_role) where.ke_role = ke_role;
    if (dari_role) where.dari_role = dari_role;

    const { count, rows } = await Perintah.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ success: true, total: count, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /perintah/masuk — Inbox (perintah ke user ini) ────────────────────
router.get("/masuk", async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;
    const where = {
      deleted_at: null,
      [Op.or]: [
        { ke_user_id: user.id },
        { ke_role: user.role || user.roleName, ke_user_id: null },
      ],
    };
    if (status) where.status = status;

    const rows = await Perintah.findAll({ where, order: [["created_at", "DESC"]] });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /perintah/keluar — Outbox (perintah dari user ini) ────────────────
router.get("/keluar", async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;
    const where = { dari_user_id: user.id, deleted_at: null };
    if (status) where.status = status;

    const rows = await Perintah.findAll({ where, order: [["created_at", "DESC"]] });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /perintah/:id — Detail + log ─────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    const logs = await PerintahLog.findAll({
      where: { perintah_id: p.id },
      order: [["created_at", "ASC"]],
    });

    res.json({ success: true, data: p, log: logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /perintah/:id — Update umum (status/progres) ─────────────────────
router.put("/:id", async (req, res) => {
  try {
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    const allowed = ["judul", "isi", "deadline", "prioritas", "lampiran_url", "progres_persen"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) p[f] = req.body[f]; });
    await p.save();

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /perintah/:id/terima — Penerima konfirmasi terima ─────────────────
router.put("/:id/terima", async (req, res) => {
  try {
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "diterima";
    await p.save();
    await addLog(p.id, "diterima", req.user, req.body.catatan || null);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /perintah/:id/tindak-lanjut — Update progress + catatan ──────────
router.put("/:id/tindak-lanjut", async (req, res) => {
  try {
    const { catatan, progres_persen, lampiran_url } = req.body;
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    if (progres_persen !== undefined) p.progres_persen = progres_persen;
    if (p.status === "diterima") p.status = "dalam_proses";
    if (lampiran_url) p.lampiran_url = lampiran_url;
    await p.save();

    await addLog(p.id, "update_progres", req.user, catatan, progres_persen, lampiran_url);
    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/ajukan — Ajukan hasil ke pemberi perintah ──────────
router.post("/:id/ajukan", async (req, res) => {
  try {
    const { catatan, lampiran_url } = req.body;
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "diajukan";
    if (lampiran_url) p.lampiran_url = lampiran_url;
    await p.save();
    await addLog(p.id, "ajukan", req.user, catatan, null, lampiran_url);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/setujui — Pemberi perintah setujui hasil ──────────
router.post("/:id/setujui", async (req, res) => {
  try {
    const { catatan } = req.body;
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "disetujui";
    p.progres_persen = 100;
    await p.save();
    await addLog(p.id, "setujui", req.user, catatan, 100);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/kembalikan — Kembalikan + catatan perbaikan ────────
router.post("/:id/kembalikan", async (req, res) => {
  try {
    const { catatan } = req.body;
    if (!catatan) return res.status(400).json({ error: "catatan wajib diisi saat mengembalikan" });

    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "dikembalikan";
    await p.save();
    await addLog(p.id, "kembalikan", req.user, catatan);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/tolak — Tolak + alasan ────────────────────────────
router.post("/:id/tolak", async (req, res) => {
  try {
    const { catatan } = req.body;
    if (!catatan) return res.status(400).json({ error: "catatan wajib diisi saat menolak" });

    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "ditolak";
    await p.save();
    await addLog(p.id, "tolak", req.user, catatan);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/selesai — Mark selesai ────────────────────────────
router.post("/:id/selesai", async (req, res) => {
  try {
    const { catatan, lampiran_url } = req.body;
    const p = await Perintah.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    p.status = "selesai";
    p.progres_persen = 100;
    if (lampiran_url) p.lampiran_url = lampiran_url;
    await p.save();
    await addLog(p.id, "selesai", req.user, catatan, 100, lampiran_url);

    res.json({ success: true, data: p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /perintah/:id/delegasikan — KaDin delegasikan ke bawahan ─────────
router.post("/:id/delegasikan", async (req, res) => {
  try {
    const { ke_user_id, ke_role, catatan } = req.body;
    if (!ke_role) return res.status(400).json({ error: "ke_role wajib" });

    const parent = await Perintah.findByPk(req.params.id);
    if (!parent) return res.status(404).json({ error: "Perintah tidak ditemukan" });

    const delegasi = await Perintah.create({
      judul: `[Delegasi] ${parent.judul}`,
      isi: parent.isi,
      dari_role: req.user.role || req.user.roleName,
      dari_user_id: req.user.id,
      ke_role,
      ke_user_id: ke_user_id || null,
      prioritas: parent.prioritas,
      deadline: parent.deadline,
      perintah_induk_id: parent.id,
      status: "terkirim",
    });

    await addLog(parent.id, "delegasi", req.user, `Didelegasikan ke ${ke_role}. ${catatan || ""}`);
    res.status(201).json({ success: true, data: delegasi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /perintah/:id/history — Audit trail ──────────────────────────────
router.get("/:id/history", async (req, res) => {
  try {
    const logs = await PerintahLog.findAll({
      where: { perintah_id: req.params.id },
      order: [["created_at", "ASC"]],
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
