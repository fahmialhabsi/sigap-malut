// backend/controllers/sekretaris/inboxKadinController.js
// Mengelola perintah/task yang masuk dari Kepala Dinas ke Sekretaris

import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import Perintah from "../../models/Perintah.js";
import PerintahLog from "../../models/PerintahLog.js";
import NotifikasiSekretaris from "../../models/NotifikasiSekretaris.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

// GET /api/sekretaris/inbox-kadin
export const getInboxKadin = async (req, res) => {
  try {
    const { status, prioritas } = req.query;
    const where = { ke_role: "sekretaris" };
    if (status) where.status = status;
    if (prioritas) where.prioritas = prioritas;

    const perintah = await Perintah.findAll({
      where,
      order: [
        [sequelize.literal(`CASE WHEN prioritas='mendesak' THEN 1 WHEN prioritas='tinggi' THEN 2 WHEN prioritas='normal' THEN 3 ELSE 4 END`), "ASC"],
        ["created_at", "DESC"],
      ],
      limit: 100,
      raw: true,
    }).catch(() => []);

    // Hitung berapa lama sudah masuk (dalam jam)
    const now = new Date();
    const enriched = perintah.map((p) => ({
      ...p,
      jam_masuk: p.created_at ? Math.round((now - new Date(p.created_at)) / 3600000) : null,
      is_overdue: p.deadline && new Date(p.deadline) < now && !["selesai", "ditolak"].includes(p.status),
    }));

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/inbox-kadin/:id
export const getInboxKadinDetail = async (req, res) => {
  try {
    const perintah = await Perintah.findByPk(req.params.id, { raw: true });
    if (!perintah) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });

    const logs = await PerintahLog.findAll({
      where: { perintah_id: req.params.id },
      order: [["created_at", "ASC"]],
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: { ...perintah, logs } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/inbox-kadin/:id/konfirmasi
export const konfirmasiTerima = async (req, res) => {
  try {
    const perintah = await Perintah.findByPk(req.params.id);
    if (!perintah) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });
    if (perintah.ke_role !== "sekretaris")
      return res.status(403).json({ success: false, message: "Bukan perintah untuk Sekretaris." });

    await perintah.update({ status: "dibaca" });

    await PerintahLog.create({
      perintah_id: perintah.id,
      aksi: "diterima",
      oleh_user_id: req.user?.id,
      catatan: "Perintah dikonfirmasi terima oleh Sekretaris",
    }).catch(() => {});

    res.json({ success: true, message: "Perintah dikonfirmasi." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/inbox-kadin/:id/distribusi
export const distribusiKeBawahan = async (req, res) => {
  const { ke_role, isi_distribusi, deadline } = req.body;
  if (!ke_role) return res.status(400).json({ success: false, message: "ke_role wajib diisi." });

  try {
    const parent = await Perintah.findByPk(req.params.id);
    if (!parent) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });

    // Buat perintah turunan ke bawahan
    const baru = await Perintah.create({
      judul: `[Distribusi] ${parent.judul || parent.isi?.slice(0, 80)}`,
      dari_role: "sekretaris",
      dari_user_id: req.user?.id,
      ke_role,
      isi: isi_distribusi || parent.isi,
      prioritas: parent.prioritas || "normal",
      deadline: deadline || parent.deadline,
      status: "terkirim",
      perintah_induk_id: parent.id,
    });

    await PerintahLog.create({
      perintah_id: parent.id,
      aksi: "delegasi",
      oleh_user_id: req.user?.id,
      catatan: `Didistribusikan ke ${ke_role} (Perintah #${baru.id})`,
    }).catch(() => {});

    await parent.update({ status: "diproses" });

    res.json({ success: true, message: "Perintah berhasil didistribusikan.", data: baru });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/inbox-kadin/:id/lapor-selesai
export const laporSelesai = async (req, res) => {
  const { catatan } = req.body || {};
  try {
    const perintah = await Perintah.findByPk(req.params.id);
    if (!perintah) return res.status(404).json({ success: false, message: "Perintah tidak ditemukan." });

    await perintah.update({ status: "selesai", progres_persen: 100 });

    await PerintahLog.create({
      perintah_id: perintah.id,
      aksi: "selesai",
      oleh_user_id: req.user?.id,
      catatan: catatan || "Dilaporkan selesai oleh Sekretaris",
    }).catch(() => {});

    res.json({ success: true, message: "Perintah dilaporkan selesai." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/inbox-kadin/stats
export const getInboxKadinStats = async (req, res) => {
  try {
    const [total, belumDibaca, diproses, selesai, terlambat] = await Promise.all([
      Perintah.count({ where: { ke_role: "sekretaris" } }).catch(() => 0),
      Perintah.count({ where: { ke_role: "sekretaris", status: "diterbitkan" } }).catch(() => 0),
      Perintah.count({ where: { ke_role: "sekretaris", status: { [Op.in]: ["dibaca", "diproses"] } } }).catch(() => 0),
      Perintah.count({ where: { ke_role: "sekretaris", status: "selesai" } }).catch(() => 0),
      Perintah.count({
        where: {
          ke_role: "sekretaris",
          status: { [Op.notIn]: ["selesai", "ditolak"] },
          deadline: { [Op.lt]: new Date() },
        },
      }).catch(() => 0),
    ]);

    res.json({ success: true, data: { total, belum_dibaca: belumDibaca, diproses, selesai, terlambat } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
