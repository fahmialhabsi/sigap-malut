import { Op } from "sequelize";
import { PengajuanKeKepalaDinas } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";

const PRE_GATEWAY_STATUS = ["diajukan_ke_sekretaris", "dalam_review_sekretaris"];

export async function listPengajuanKadinGateway(req, res) {
  try {
    const { limit = 50, q } = req.query || {};
    const where = {
      divalidasi_sekretaris: false,
      status: { [Op.in]: PRE_GATEWAY_STATUS },
    };
    if (q) {
      where[Op.or] = [
        { judul: { [Op.iLike]: `%${q}%` } },
        { nomor_pengajuan: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const rows = await PengajuanKeKepalaDinas.findAll({
      where,
      order: [["created_at", "ASC"]],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat antrian gateway Kepala Dinas",
      error: err.message,
    });
  }
}

export async function mulaiReviewPengajuanKadin(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await PengajuanKeKepalaDinas.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    if (row.divalidasi_sekretaris) {
      return res.status(400).json({ success: false, message: "Pengajuan sudah diteruskan ke Ka.Dinas" });
    }
    if (row.status !== "diajukan_ke_sekretaris") {
      return res.status(400).json({ success: false, message: "Hanya pengajuan baru yang dapat dimulai review-nya" });
    }
    row.status = "dalam_review_sekretaris";
    await row.save();
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status review",
      error: err.message,
    });
  }
}

export async function teruskanPengajuanKeKadin(req, res) {
  try {
    const io = getIO();
    const id = parseInt(req.params.id, 10);
    const { catatan_sekretaris } = req.body || {};
    const row = await PengajuanKeKepalaDinas.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    if (row.divalidasi_sekretaris) {
      return res.status(400).json({ success: false, message: "Sudah diteruskan ke Ka.Dinas" });
    }
    if (!PRE_GATEWAY_STATUS.includes(row.status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid untuk diteruskan" });
    }

    const sekId = req.user?.id;
    row.divalidasi_sekretaris = true;
    row.divalidasi_at = new Date();
    row.divalidasi_oleh = sekId;
    row.catatan_sekretaris = catatan_sekretaris || row.catatan_sekretaris || null;
    row.status = "diteruskan_ke_kadin";
    await row.save();

    if (io) {
      io.to(ROOMS.KADIN).emit("kadin:pengajuan:gateway", {
        id: row.id,
        nomor_pengajuan: row.nomor_pengajuan,
        judul: row.judul,
        jenis: row.jenis,
      });
    }

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal meneruskan ke Kepala Dinas",
      error: err.message,
    });
  }
}

export async function kembalikanPengajuanKePengaju(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { catatan } = req.body || {};
    if (!catatan || !String(catatan).trim()) {
      return res.status(400).json({ success: false, message: "Catatan wajib untuk pengembalian" });
    }
    const row = await PengajuanKeKepalaDinas.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    if (row.divalidasi_sekretaris) {
      return res.status(400).json({ success: false, message: "Pengajuan sudah diteruskan; gunakan alur Ka.Dinas" });
    }
    if (!PRE_GATEWAY_STATUS.includes(row.status)) {
      return res.status(400).json({ success: false, message: "Status tidak dapat dikembalikan dari gateway" });
    }

    row.status = "draft";
    row.catatan_sekretaris = String(catatan).trim();
    row.revisi_ke = Number(row.revisi_ke || 0) + 1;
    row.divalidasi_sekretaris = false;
    row.divalidasi_at = null;
    row.divalidasi_oleh = null;
    await row.save();

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengembalikan pengajuan",
      error: err.message,
    });
  }
}
