import { Op } from "sequelize";
import { PengajuanKeKepalaDinas } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";

/** Jenis pengajuan yang memerlukan PIN (aksi kritikal) */
const JENIS_MEMERLUKAN_PIN = new Set(["persetujuan_anggaran"]);

function pad3(n) {
  return String(n).padStart(3, "0");
}

async function genNomorPengajuanKadin() {
  const now = new Date();
  const tahun = now.getFullYear();
  const prefix = `PKD-${tahun}-`;
  const last = await PengajuanKeKepalaDinas.findOne({
    where: { nomor_pengajuan: { [Op.like]: `${prefix}%` } },
    order: [["id", "DESC"]],
  });
  const lastNo = last?.nomor_pengajuan || "";
  const m = lastNo.match(/PKD-\d{4}-(\d+)/);
  const next = (m ? parseInt(m[1], 10) : 0) + 1;
  return `${prefix}${pad3(next)}`;
}

export async function listApproval(req, res) {
  try {
    const { status, q, limit = 50 } = req.query || {};
    const where = {};
    if (status) where.status = status;
    else where.status = { [Op.in]: ["diteruskan_ke_kadin", "dalam_review_kadin"] };

    if (q) {
      where[Op.or] = [
        { judul: { [Op.iLike]: `%${q}%` } },
        { nomor_pengajuan: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const rows = await PengajuanKeKepalaDinas.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal list approval", error: err.message });
  }
}

export async function getApprovalDetail(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await PengajuanKeKepalaDinas.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    if (!row.divalidasi_sekretaris) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan belum tersedia bagi Ka.Dinas (gateway Sekretaris).",
      });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil detail approval", error: err.message });
  }
}

export async function putuskanApproval(req, res) {
  try {
    const io = getIO();
    const kadinId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { keputusan, catatan } = req.body || {};

    if (!keputusan || !["setuju", "tolak", "kembalikan"].includes(String(keputusan))) {
      return res.status(400).json({ success: false, message: "Keputusan harus: setuju | tolak | kembalikan" });
    }
    if ((keputusan === "tolak" || keputusan === "kembalikan") && !catatan) {
      return res.status(400).json({ success: false, message: "Catatan wajib untuk tolak/kembalikan" });
    }

    const row = await PengajuanKeKepalaDinas.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });

    if (!row.divalidasi_sekretaris) {
      return res.status(403).json({
        success: false,
        message: "Keputusan ditolak: pengajuan belum melalui gateway Sekretaris.",
      });
    }
    if (!["diteruskan_ke_kadin", "dalam_review_kadin"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "Status pengajuan tidak valid untuk putusan Ka.Dinas" });
    }

    if (JENIS_MEMERLUKAN_PIN.has(row.jenis)) {
      const expected = process.env.CRITICAL_ACTION_PIN || "123456";
      const pin = String(req.body?.pin || "");
      if (!pin) {
        return res.status(400).json({
          success: false,
          message: `PIN wajib untuk keputusan jenis "${row.jenis}".`,
        });
      }
      if (pin !== String(expected)) {
        return res.status(403).json({ success: false, message: "PIN salah" });
      }
    }

    row.status =
      keputusan === "setuju"
        ? "disetujui"
        : keputusan === "tolak"
          ? "ditolak"
          : "dikembalikan";
    row.catatan_kadin = catatan || null;
    row.diputuskan_at = new Date();
    row.diputuskan_oleh = kadinId;
    if (row.status === "dikembalikan") {
      row.revisi_ke = Number(row.revisi_ke || 0) + 1;
    }
    await row.save();

    if (io) {
      io.to(ROOMS.SEKRETARIS).emit("kadin:approval:diputuskan", {
        id: row.id,
        status: row.status,
        catatan_kadin: row.catatan_kadin,
      });
    }

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal putuskan approval", error: err.message });
  }
}

// helper internal: buat pengajuan (untuk seed/flow bawah) — nomor otomatis
export async function _createPengajuanKadinInternal(payload) {
  const nomor_pengajuan = await genNomorPengajuanKadin();
  return await PengajuanKeKepalaDinas.create({ nomor_pengajuan, ...payload });
}

