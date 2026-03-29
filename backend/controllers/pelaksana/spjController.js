// backend/controllers/pelaksana/spjController.js
// SPJ Pelaksana — BAGIAN C.5 + H (KRITIS: Pelaksana SATU-SATUNYA boleh buat SPJ)
// spjSelfGuard wajib di routes!

import { Op } from "sequelize";
import sequelize from "../../config/database.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";

// Spj didaftarkan lewat factory di models/index.js → ambil via sequelize.models
const getSpj = () => sequelize.models.Spj;

const userId = (req) => req.user.id;

// ── GET /api/pelaksana/spj — Riwayat SPJ saya (BAGIAN D.3 Panel SPJ Saya) ──
export const getSpjSaya = async (req, res) => {
  try {
    const uid = userId(req);
    const { status, limit = 10 } = req.query;
    const Spj = getSpj();

    const where = { pelaksana_id: uid };
    if (status) where.status = { [Op.in]: status.split(",") };

    const spjs = await Spj.findAll({
      where,
      order: [["updated_at", "DESC"]],
      limit: Number(limit),
    });

    res.json({ success: true, data: spjs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /api/pelaksana/spj/:id — Detail SPJ + timeline ──
export const getSpjDetail = async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findOne({
      where: { id: req.params.id, pelaksana_id: userId(req) },
    });

    if (!spj) {
      return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    }

    res.json({ success: true, data: spj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj — Buat SPJ baru (multi-jenis: SPPD/Honor/ATK/Lain) ──
export const buatSpj = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const uid = userId(req);
    const Spj = getSpj();
    const {
      judul,
      kegiatan,
      jenis_spj,       // 'SPPD' | 'HONOR' | 'ATK' | 'LAIN'
      tanggal_kegiatan,
      total_anggaran,
      keterangan,
    } = req.body;

    // Validasi jenis SPJ
    const validJenis = ["SPPD", "HONOR", "ATK", "LAIN"];
    if (jenis_spj && !validJenis.includes(jenis_spj)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Jenis SPJ tidak valid" });
    }

    // spjSelfGuard sudah paksa pelaksana_id = uid
    const spj = await Spj.create(
      {
        pelaksana_id: uid,
        judul: judul || kegiatan,
        kegiatan: kegiatan || judul,
        tanggal_kegiatan: tanggal_kegiatan || new Date(),
        total_anggaran: parseFloat(total_anggaran) || 0,
        keterangan,
        status: "draft",
        // Lampiran via multer disimpan terpisah oleh route
        file_bukti: req.files?.lampiran_sppd?.[0]?.filename || null,
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({ success: true, data: spj });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /api/pelaksana/spj/:id — Update DRAFT SPJ ──
export const updateSpjDraft = async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        pelaksana_id: userId(req),
        status: "draft",
      },
    });

    if (!spj) {
      return res
        .status(404)
        .json({ success: false, message: "SPJ draft tidak ditemukan" });
    }

    const allowedFields = ["judul", "kegiatan", "tanggal_kegiatan", "total_anggaran", "keterangan"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.files?.lampiran_sppd?.[0]) {
      updates.file_bukti = req.files.lampiran_sppd[0].filename;
    }

    await spj.update(updates);
    res.json({ success: true, data: spj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj/:id/submit — Submit ke Bendahara ──
export const submitSpj = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const Spj = getSpj();
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        pelaksana_id: userId(req),
        status: "draft",
      },
    });

    if (!spj) {
      return res
        .status(404)
        .json({ success: false, message: "SPJ draft tidak ditemukan" });
    }

    // Validasi field wajib
    if (!spj.judul || !spj.tanggal_kegiatan || !spj.total_anggaran) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Judul, tanggal kegiatan, dan total anggaran wajib diisi sebelum submit",
      });
    }

    spj.status = "submitted";
    await spj.save({ transaction: t });

    // Notif ke Bendahara Pengeluaran
    const bendaharaList = await User.findAll({
      where: { role: "bendahara_pengeluaran" },
      attributes: ["id"],
    });
    await Promise.all(
      bendaharaList.map((b) =>
        Notification.create(
          {
            target_user_id: b.id,
            message: `SPJ baru dari ${req.user.nama_lengkap || "Pelaksana"}: ${spj.judul}`,
            link: `/spj/${spj.id}`,
          },
          { transaction: t },
        ),
      ),
    );

    await t.commit();
    res.json({ success: true, data: spj });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /api/pelaksana/spj/:id/perbaiki — Submit ulang setelah dikembalikan ──
export const perbaikiSpj = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const Spj = getSpj();
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        pelaksana_id: userId(req),
        status: "rejected",
      },
    });

    if (!spj) {
      return res.status(404).json({
        success: false,
        message: "SPJ yang dikembalikan tidak ditemukan",
      });
    }

    // Update field yang diperbaiki
    const allowedFields = ["judul", "kegiatan", "tanggal_kegiatan", "total_anggaran", "keterangan"];
    const updates = { status: "submitted" };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.files?.lampiran_perbaikan?.[0]) {
      updates.file_bukti = req.files.lampiran_perbaikan[0].filename;
    }

    await spj.update(updates, { transaction: t });

    // Notif ke Bendahara
    const bendaharaList = await User.findAll({
      where: { role: "bendahara_pengeluaran" },
      attributes: ["id"],
    });
    await Promise.all(
      bendaharaList.map((b) =>
        Notification.create(
          {
            target_user_id: b.id,
            message: `SPJ diperbaiki oleh ${req.user.nama_lengkap || "Pelaksana"}: ${spj.judul}`,
            link: `/spj/${spj.id}`,
          },
          { transaction: t },
        ),
      ),
    );

    await t.commit();
    res.json({ success: true, data: spj });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── DELETE /api/pelaksana/spj/:id — Hapus DRAFT saja ──
export const hapusSpjDraft = async (req, res) => {
  try {
    const Spj = getSpj();
    const deleted = await Spj.destroy({
      where: {
        id: req.params.id,
        pelaksana_id: userId(req),
        status: "draft",
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "SPJ draft tidak ditemukan atau sudah disubmit",
      });
    }

    res.json({ success: true, message: "SPJ draft dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /api/pelaksana/spj/:id/export — Download PDF SPJ disetujui ──
export const exportSpj = async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findOne({
      where: {
        id: req.params.id,
        pelaksana_id: userId(req),
        status: { [Op.in]: ["verified"] },
      },
    });

    if (!spj) {
      return res.status(404).json({
        success: false,
        message: "SPJ tidak ditemukan atau belum disetujui",
      });
    }

    // Placeholder: kirim data JSON sampai PDF generator tersedia
    res.json({
      success: true,
      message: "PDF export akan tersedia setelah integrasi PDF generator",
      data: spj,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
