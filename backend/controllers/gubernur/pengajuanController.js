import { Op } from "sequelize";
import { PengajuanKeGubernur } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";

function pad3(n) {
  return String(n).padStart(3, "0");
}

async function genNomorPengajuan() {
  const now = new Date();
  const tahun = now.getFullYear();
  const prefix = `PG-${tahun}-`;
  const last = await PengajuanKeGubernur.findOne({
    where: { nomor_pengajuan: { [Op.like]: `${prefix}%` } },
    order: [["id", "DESC"]],
  });
  const lastNo = last?.nomor_pengajuan || "";
  const m = lastNo.match(/PG-\d{4}-(\d+)/);
  const next = (m ? parseInt(m[1], 10) : 0) + 1;
  return `${prefix}${pad3(next)}`;
}

export async function listPengajuan(req, res) {
  try {
    const { status, q, limit = 50 } = req.query || {};
    const where = {};
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { judul: { [Op.iLike]: `%${q}%` } },
        { nomor_pengajuan: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const rows = await PengajuanKeGubernur.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal list pengajuan", error: err.message });
  }
}

export async function getPengajuanDetail(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await PengajuanKeGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil detail pengajuan", error: err.message });
  }
}

export async function putuskanPengajuan(req, res) {
  try {
    const io = getIO();
    const gubernurId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { keputusan, catatan } = req.body || {};

    if (!keputusan || !["setuju", "tolak", "kembalikan"].includes(String(keputusan))) {
      return res.status(400).json({ success: false, message: "Keputusan harus: setuju | tolak | kembalikan" });
    }
    if ((keputusan === "tolak" || keputusan === "kembalikan") && !catatan) {
      return res.status(400).json({ success: false, message: "Catatan wajib untuk tolak/kembalikan" });
    }

    const row = await PengajuanKeGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });

    row.status =
      keputusan === "setuju"
        ? "disetujui"
        : keputusan === "tolak"
          ? "ditolak"
          : "dikembalikan";
    row.catatan_gubernur = catatan || null;
    row.diputuskan_at = new Date();
    row.diputuskan_oleh = gubernurId;
    if (row.status === "dikembalikan") {
      row.revisi_ke = Number(row.revisi_ke || 0) + 1;
    }
    await row.save();

    if (io) {
      io.to(ROOMS.KADIN).emit("gubernur:pengajuan:diputuskan", {
        id: row.id,
        status: row.status,
        catatan_gubernur: row.catatan_gubernur,
      });
    }

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal putuskan pengajuan", error: err.message });
  }
}

export async function getRiwayatPengajuan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await PengajuanKeGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });

    const chain = [];
    let cur = row;
    for (let i = 0; i < 20 && cur; i += 1) {
      chain.push(cur);
      if (!cur.revisi_dari) break;
      cur = await PengajuanKeGubernur.findByPk(cur.revisi_dari);
    }

    return res.json({ success: true, data: chain });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil riwayat", error: err.message });
  }
}

// Helper internal untuk seed/Prompt 2 (kadin): buat pengajuan masuk ke gubernur
export async function _createPengajuanInternal(payload) {
  const nomor_pengajuan = await genNomorPengajuan();
  return await PengajuanKeGubernur.create({ nomor_pengajuan, ...payload });
}

