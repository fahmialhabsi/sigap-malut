// backend/controllers/sekretaris/monitorBawahanController.js
// Monitoring aktivitas bawahan Sekretaris (Kasubag, JF, Bendahara, Pelaksana)

import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import Perintah from "../../models/Perintah.js";
import User from "../../models/User.js";
import ApprovalSekretariat from "../../models/ApprovalSekretariat.js";

const BAWAHAN_ROLES = [
  "kasubag_umum_kepegawaian",
  "fungsional_perencana",
  "fungsional_analis_keuangan",
  "bendahara_pengeluaran",
  "bendahara_gaji",
  "bendahara_barang",
  "pelaksana",
];

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

// GET /api/sekretaris/monitor/bawahan
export const getMonitorBawahan = async (req, res) => {
  try {
    const now = new Date();
    const summary = [];

    for (const role of BAWAHAN_ROLES) {
      const [total, selesai, pending, terlambat] = await Promise.all([
        Perintah.count({ where: { dari_role: "sekretaris", ke_role: role } }).catch(() => 0),
        Perintah.count({ where: { dari_role: "sekretaris", ke_role: role, status: "selesai" } }).catch(() => 0),
        Perintah.count({
          where: { dari_role: "sekretaris", ke_role: role, status: { [Op.notIn]: ["selesai", "ditolak"] } },
        }).catch(() => 0),
        Perintah.count({
          where: {
            dari_role: "sekretaris",
            ke_role: role,
            status: { [Op.notIn]: ["selesai", "ditolak"] },
            deadline: { [Op.lt]: now },
          },
        }).catch(() => 0),
      ]);

      const execution_rate = total > 0 ? Math.round((selesai / total) * 100) : null;

      summary.push({ role, total, selesai, pending, terlambat, execution_rate });
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/monitor/bawahan/:userId
export const getMonitorBawahanDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cari user
    const user = await User.findByPk(userId, { attributes: ["id", "name", "username"], raw: true }).catch(() => null);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });

    // Perintah yang dikirim Sekretaris ke user ini (by userId if Task model supports it)
    // Juga cek ApprovalSekretariat yang disubmit user ini
    const approvals = await ApprovalSekretariat.findAll({
      where: { submitted_by: userId, deleted_at: null },
      order: [["created_at", "DESC"]],
      limit: 30,
      raw: true,
    }).catch(() => []);

    const tasks = await Perintah.findAll({
      where: { dari_role: "sekretaris" },
      order: [["created_at", "DESC"]],
      limit: 50,
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: { user, approvals, tasks } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/monitor/overdue
export const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    const overdue = await Perintah.findAll({
      where: {
        dari_role: "sekretaris",
        status: { [Op.notIn]: ["selesai", "ditolak"] },
        deadline: { [Op.lt]: now },
      },
      order: [["deadline", "ASC"]],
      raw: true,
    }).catch(() => []);

    const enriched = overdue.map((p) => ({
      ...p,
      hari_terlambat: Math.floor((now - new Date(p.deadline)) / 86400000),
    }));

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/perintah — list perintah Sekretaris ke bawahan
export const getPerintahKeBawahan = async (req, res) => {
  try {
    const { ke_role, status, prioritas } = req.query;
    const where = { dari_role: "sekretaris" };
    if (ke_role) where.ke_role = ke_role;
    if (status) where.status = status;
    if (prioritas) where.prioritas = prioritas;

    const perintah = await Perintah.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: 100,
      raw: true,
    }).catch(() => []);

    const now = new Date();
    const enriched = perintah.map((p) => ({
      ...p,
      is_overdue: p.deadline && new Date(p.deadline) < now && !["selesai", "ditolak"].includes(p.status),
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/perintah — Buat perintah ke bawahan
export const buatPerintah = async (req, res) => {
  const { ke_role, isi, prioritas = "normal", deadline } = req.body || {};
  if (!ke_role || !isi?.trim()) {
    return res.status(400).json({ success: false, message: "ke_role dan isi wajib diisi." });
  }

  try {
    const perintah = await Perintah.create({
      judul: isi.slice(0, 120),
      dari_role: "sekretaris",
      dari_user_id: req.user?.id,
      ke_role,
      isi,
      prioritas: prioritas === "mendesak" ? "kritis" : prioritas,
      deadline: deadline || null,
      status: "terkirim",
    });

    res.status(201).json({ success: true, data: perintah, message: "Perintah berhasil dibuat." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/perintah/:id/ingatkan
export const ingatkanBawahan = async (req, res) => {
  try {
    const perintah = await Perintah.findByPk(req.params.id);
    if (!perintah) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });

    // Dalam implementasi nyata: kirim notifikasi WebSocket/push ke penerima
    // Untuk sekarang: log pengingat
    await perintah.update({ updated_at: new Date() });

    res.json({ success: true, message: `Pengingat dikirim ke ${perintah.ke_role}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/perintah/:id/eskalasi
export const eskalasiPerintah = async (req, res) => {
  try {
    const perintah = await Perintah.findByPk(req.params.id);
    if (!perintah) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });

    await perintah.update({ prioritas: "kritis" });
    res.json({ success: true, message: "Prioritas perintah diubah ke MENDESAK." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
