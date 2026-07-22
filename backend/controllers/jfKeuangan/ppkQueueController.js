import { Op } from "sequelize";
import Spj from "../../models/Spj.js";
import Dpa from "../../models/Dpa.js";

function normalizeJenisBendahara(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("gaji")) return "gaji";
  if (v.includes("barang") || v.includes("bmd")) return "barang";
  return "pengeluaran";
}

export async function listQueue(req, res) {
  try {
    const jenis = normalizeJenisBendahara(req.query.jenis || req.query.type);
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);

    const rows = await Spj.findAll({
      where: {
        jenis_bendahara: jenis,
        status: { [Op.in]: ["diajukan_ke_ppk", "dikembalikan_ppk"] },
      },
      order: [["updated_at", "DESC"]],
      limit,
    });

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil PPK queue",
      error: err.message,
    });
  }
}

export async function getDetail(req, res) {
  try {
    const spjId = req.params.spjId;
    const row = await Spj.findByPk(spjId);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    const dpa = await Dpa.findOne({
      where: {
        tahun_anggaran: new Date().getFullYear(),
        kode_rekening: row.kode_rekening,
      },
    }).catch(() => null);

    const pagu = dpa ? Number(dpa.pagu_anggaran || 0) : null;
    const realisasi = dpa ? Number(dpa.realisasi || 0) : null;
    const sisa = dpa ? Math.max(0, pagu - realisasi) : null;
    const overBudget = dpa ? Number(row.nominal || 0) > sisa : false;

    return res.json({
      success: true,
      data: {
        spj: row,
        dpa: dpa ? { id: dpa.id, pagu_anggaran: pagu, realisasi, sisa } : null,
        over_budget: overBudget,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SPJ", error: err.message });
  }
}

export async function terima(req, res) {
  try {
    const userId = req.user?.id;
    const spjId = req.params.spjId;
    const row = await Spj.findByPk(spjId);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    if (!["diajukan_ke_ppk", "dikembalikan_ppk"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "SPJ bukan dalam antrean verifikasi PPK" });
    }

    row.status = "terverifikasi_ppk";
    row.diverifikasi_ppk_oleh = userId;
    row.diverifikasi_ppk_at = new Date();
    row.catatan_ppk = req.body?.catatan_ppk || null;
    await row.save();

    return res.json({ success: true, message: "SPJ diverifikasi PPK (OK)", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal verifikasi OK", error: err.message });
  }
}

export async function kembalikan(req, res) {
  try {
    const userId = req.user?.id;
    const spjId = req.params.spjId;
    const { catatan_ppk } = req.body || {};
    if (!catatan_ppk) {
      return res.status(400).json({ success: false, message: "catatan_ppk wajib diisi" });
    }

    const row = await Spj.findByPk(spjId);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    row.status = "dikembalikan_ppk";
    row.diverifikasi_ppk_oleh = userId;
    row.diverifikasi_ppk_at = new Date();
    row.catatan_ppk = catatan_ppk;
    row.revisi_ke = (row.revisi_ke || 0) + 1;
    await row.save();

    return res.json({ success: true, message: "SPJ dikembalikan ke Bendahara", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengembalikan SPJ", error: err.message });
  }
}

export async function tolak(req, res) {
  try {
    const userId = req.user?.id;
    const spjId = req.params.spjId;
    const { dasar_hukum_tolak, catatan_ppk } = req.body || {};
    if (!dasar_hukum_tolak) {
      return res.status(400).json({ success: false, message: "dasar_hukum_tolak wajib diisi" });
    }

    const row = await Spj.findByPk(spjId);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    row.status = "ditolak_ppk";
    row.diverifikasi_ppk_oleh = userId;
    row.diverifikasi_ppk_at = new Date();
    row.dasar_hukum_tolak = dasar_hukum_tolak;
    row.catatan_ppk = catatan_ppk || row.catatan_ppk || null;
    await row.save();

    return res.json({ success: true, message: "SPJ ditolak PPK", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal menolak SPJ", error: err.message });
  }
}

