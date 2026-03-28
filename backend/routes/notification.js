import express from "express";
import { Op } from "sequelize";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/notifications?limit=10
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit, 10) || 10;
    const notifications = await Notification.findAll({
      where: { target_user_id: userId },
      order: [["created_at", "DESC"]],
      limit,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bidang-ketersediaan
// Kepala Bidang Ketersediaan mengirim notifikasi ke Fungsional/Pelaksana Ketersediaan
router.post("/broadcast-bidang-ketersediaan", async (req, res) => {
  try {
    console.log("[NOTIF] req.user:", req.user);
    const senderRole = req.user?.role;
    const allowedSenders = [
      "kepala_bidang_ketersediaan",
      "kepala_bidang",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, tujuan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    // Sanitasi: max 500 karakter, tidak ada HTML
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"]'/g, "")
          .slice(0, 500)
      : null;
    // Pilih role target sesuai tujuan
    let targetRoles = [];
    if (tujuan === "fungsional_ketersediaan")
      targetRoles = ["fungsional_ketersediaan"];
    else if (tujuan === "pelaksana_ketersediaan")
      targetRoles = ["pelaksana_ketersediaan"];
    else
      return res
        .status(400)
        .json({ success: false, message: "Tujuan tidak valid." });
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada penerima terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Kepala Bidang Ketersediaan → ${tujuan}] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bidang-distribusi
// Kepala Bidang Distribusi mengirim notifikasi ke Fungsional/Pelaksana Distribusi
router.post("/broadcast-bidang-distribusi", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = [
      "kepala_bidang_distribusi",
      "kepala_bidang",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, tujuan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"]'/g, "")
          .slice(0, 500)
      : null;
    let targetRoles = [];
    if (tujuan === "fungsional_distribusi")
      targetRoles = ["fungsional_distribusi"];
    else if (tujuan === "pelaksana_distribusi")
      targetRoles = ["pelaksana_distribusi"];
    else
      return res
        .status(400)
        .json({ success: false, message: "Tujuan tidak valid." });
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada penerima terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Kepala Bidang Distribusi → ${tujuan}] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bidang-konsumsi
// Kepala Bidang Konsumsi mengirim notifikasi ke Fungsional/Pelaksana Konsumsi
router.post("/broadcast-bidang-konsumsi", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = [
      "kepala_bidang_konsumsi",
      "kepala_bidang",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, tujuan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"']/g, "")
          .slice(0, 500)
      : null;
    let targetRoles = [];
    if (tujuan === "fungsional_konsumsi") targetRoles = ["fungsional_konsumsi"];
    else if (tujuan === "pelaksana_konsumsi")
      targetRoles = ["pelaksana_konsumsi"];
    else
      return res
        .status(400)
        .json({ success: false, message: "Tujuan tidak valid." });
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada penerima terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Kepala Bidang Konsumsi → ${tujuan}] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
// PUT /api/notifications/read-all
router.put("/read-all", async (req, res) => {
  try {
    await Notification.update(
      { seen: true },
      { where: { target_user_id: req.user?.id, seen: false } },
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const n = await Notification.findOne({
      where: { id: req.params.id, target_user_id: req.user?.id },
    });
    if (!n)
      return res
        .status(404)
        .json({ success: false, message: "Notifikasi tidak ditemukan" });
    n.seen = true;
    await n.save();
    return res.json({ success: true, data: n });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bidang
// Sekretariat mengirim notifikasi koordinasi ke semua Kepala Bidang
router.post("/broadcast-bidang", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = ["sekretaris", "super_admin", "kepala_dinas"];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }

    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    // Sanitasi: max 500 karakter, tidak ada HTML
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"']/g, "")
          .slice(0, 500)
      : null;

    // Cari semua user dengan role kepala_bidang
    const targetRoles = [
      "kepala_bidang",
      "kepala_bidang_ketersediaan",
      "kepala_bidang_distribusi",
      "kepala_bidang_konsumsi",
    ];
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });

    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada Kepala Bidang yang terdaftar.",
      });
    }

    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Koordinasi Sekretariat] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));

    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-kasubag-fungsional
// Sekretaris mengirim notifikasi ke Kasubag Umum & Kepegawaian, Fungsional Perencana, Fungsional Analis Keuangan
router.post("/broadcast-kasubag-fungsional", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = ["sekretaris", "super_admin", "kepala_dinas"];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, tujuan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    // Sanitasi: max 500 karakter, tidak ada HTML
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"]'/g, "")
          .slice(0, 500)
      : null;
    // Pilih role target sesuai tujuan
    let targetRoles = [];
    if (tujuan === "kasubag_umum") {
      targetRoles = [
        "kasubag_umum_kepegawaian",
        "kasubag_umum",
        "kasubag_kepegawaian",
      ];
    } else if (tujuan === "fungsional_perencana") {
      targetRoles = ["fungsional_perencana"];
    } else if (tujuan === "fungsional_analis_keuangan") {
      targetRoles = ["fungsional_analis_keuangan"];
    } else if (tujuan === "bendahara_pengeluaran") {
      targetRoles = ["bendahara_pengeluaran"];
    } else if (tujuan === "bendahara_gaji") {
      targetRoles = ["bendahara_gaji"];
    } else if (tujuan === "bendahara_barang") {
      targetRoles = ["bendahara_barang"];
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Tujuan tidak valid." });
    }
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada penerima terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Sekretaris → ${tujuan}] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bendahara
// Kasubag Umum & Kepegawaian mengirim notifikasi ke Bendahara
router.post("/broadcast-bendahara", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = [
      "kasubag_umum_kepegawaian",
      "kasubag_umum",
      "kasubag_kepegawaian",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"]'/g, "")
          .slice(0, 500)
      : null;
    const targetRoles = ["bendahara"];
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada Bendahara terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Kasubag → Bendahara] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-pelaksana
// Kasubag Umum & Kepegawaian mengirim notifikasi ke Pelaksana
router.post("/broadcast-pelaksana", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = [
      "kasubag_umum_kepegawaian",
      "kasubag_umum",
      "kasubag_kepegawaian",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"]'/g, "")
          .slice(0, 500)
      : null;
    const targetRoles = ["pelaksana", "staf_pelaksana"];
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });
    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada Pelaksana terdaftar.",
      });
    }
    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah Kasubag → Pelaksana] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-uptd
// Kepala UPTD mengirim notifikasi ke seluruh role UPTD (Kasubag TU, Kasi, Fungsional, Pelaksana)
router.post("/broadcast-uptd", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = ["kepala_uptd", "super_admin", "kepala_dinas"];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }

    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    // Sanitasi: max 500 karakter, tidak ada HTML
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"']/g, "")
          .slice(0, 500)
      : null;

    // Cari semua user dengan role UPTD (Kasubag TU, Kasi, Fungsional, Pelaksana)
    const targetRoles = [
      "kasubag_uptd",
      "kasubag_tu_uptd",
      "seksi_manajemen_teknis",
      "seksi_manajemen_mutu",
      "kasi_uptd",
      "kasi_teknis",
      "kasi_mutu",
      "jabatan_fungsional",
      "pejabat_fungsional",
      "pelaksana",
      "staf_pelaksana",
    ];
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });

    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada user UPTD yang terdaftar.",
      });
    }

    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Broadcast Kepala UPTD] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));

    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: broadcast dari JF ke Pelaksana per bidang
async function broadcastFungsionalToPelaksana(req, res, bidang) {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = [
      "fungsional",
      "fungsional_analis",
      "fungsional_perencana",
      `fungsional_${bidang}`,
      "jabatan_fungsional",
      "pejabat_fungsional",
      "super_admin",
      "kepala_dinas",
    ];
    if (!allowedSenders.includes(senderRole)) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }
    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    const cleanPesan = String(pesan).replace(/<[^>]*>/g, "").trim().slice(0, 500);
    const cleanLink = link ? String(link).replace(/[<>"']/g, "").slice(0, 500) : null;

    const targets = await User.findAll({
      where: { role: { [Op.in]: [`pelaksana_${bidang}`, "pelaksana", "staf_pelaksana"] } },
      attributes: ["id"],
    });

    if (targets.length === 0) {
      return res.json({ success: true, sent: 0, message: "Tidak ada pelaksana terdaftar." });
    }
    const bidangLabel = bidang.charAt(0).toUpperCase() + bidang.slice(1);
    const notifs2 = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Perintah JF ${bidangLabel} → Pelaksana] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));
    await Notification.bulkCreate(notifs2);
    return res.json({ success: true, sent: notifs2.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/notifications/broadcast-fungsional-ketersediaan
router.post("/broadcast-fungsional-ketersediaan", (req, res) =>
  broadcastFungsionalToPelaksana(req, res, "ketersediaan"),
);

// POST /api/notifications/broadcast-fungsional-distribusi
router.post("/broadcast-fungsional-distribusi", (req, res) =>
  broadcastFungsionalToPelaksana(req, res, "distribusi"),
);

// POST /api/notifications/broadcast-fungsional-konsumsi
router.post("/broadcast-fungsional-konsumsi", (req, res) =>
  broadcastFungsionalToPelaksana(req, res, "konsumsi"),
);

export default router;
