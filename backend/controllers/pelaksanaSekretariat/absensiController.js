import { Op } from "sequelize";
import AbsensiHarian from "../../models/AbsensiHarian.js";

export async function getHariIni(req, res) {
  try {
    const userId = req.user?.id;
    const today = new Date().toISOString().slice(0, 10);
    const row = await AbsensiHarian.findOne({
      where: { pegawai_id: userId, tanggal: today },
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: row || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil absensi hari ini", error: err.message });
  }
}

export async function postAbsensi(req, res) {
  try {
    const userId = req.user?.id;
    const { status, keterangan } = req.body || {};
    const today = new Date().toISOString().slice(0, 10);
    if (!status) {
      return res.status(400).json({ success: false, message: "status wajib" });
    }
    const allowed = ["hadir", "sakit", "ijin", "cuti", "dinas_luar", "alpha"];
    if (!allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ success: false, message: "status tidak valid" });
    }

    const existing = await AbsensiHarian.findOne({ where: { pegawai_id: userId, tanggal: today } });
    if (existing) {
      existing.status = String(status).toLowerCase();
      existing.keterangan = keterangan || null;
      await existing.save();
      return res.json({ success: true, message: "Absensi diperbarui", data: existing });
    }

    const row = await AbsensiHarian.create({
      pegawai_id: userId,
      tanggal: today,
      status: String(status).toLowerCase(),
      keterangan: keterangan || null,
      perlu_substitusi: ["sakit", "cuti"].includes(String(status).toLowerCase()),
    });
    return res.json({ success: true, message: "Absensi tersimpan", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal menyimpan absensi", error: err.message });
  }
}

export async function getBulanIni(req, res) {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const rows = await AbsensiHarian.findAll({
      where: { pegawai_id: userId, tanggal: { [Op.between]: [start, end] } },
      order: [["tanggal", "ASC"]],
      limit: 100,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil absensi bulan ini", error: err.message });
  }
}

