import { Op } from "sequelize";
import { InstruksiGubernur, NotifikasiGubernur } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";

export async function listInboxGubernur(req, res) {
  try {
    const kadinId = req.user?.id;
    const { status, jenis, limit = 50 } = req.query || {};
    const where = { assigned_to: kadinId };
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;

    const rows = await InstruksiGubernur.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil inbox gubernur", error: err.message });
  }
}

export async function getInboxGubernurDetail(req, res) {
  try {
    const kadinId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await InstruksiGubernur.findByPk(id);
    if (!row || row.assigned_to !== kadinId) {
      return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil detail instruksi", error: err.message });
  }
}

export async function konfirmasiTerimaInstruksi(req, res) {
  try {
    const io = getIO();
    const kadinId = req.user?.id;
    const id = parseInt(req.params.id, 10);

    const row = await InstruksiGubernur.findByPk(id);
    if (!row || row.assigned_to !== kadinId) {
      return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    }

    // Status: DITERBITKAN -> DIBACA
    if (row.status === "diterbitkan") {
      row.status = "dibaca";
      row.dibaca_at = new Date();
      await row.save();
    }

    // Notif + WS ke Gubernur room
    if (io) {
      io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:dibaca", {
        id: row.id,
        nomor: row.nomor_instruksi,
        judul: row.judul,
        dibaca_at: row.dibaca_at,
      });
    }

    await NotifikasiGubernur.create({
      user_id: row.created_by,
      jenis: "perintah_dibaca",
      judul: "Instruksi dibaca Kepala Dinas",
      isi: `${row.nomor_instruksi || `#${row.id}`} — ${row.judul}`,
      referensi_id: row.id,
      referensi_tabel: "instruksi_gubernur",
      sudah_dibaca: false,
    }).catch(() => null);

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal konfirmasi terima", error: err.message });
  }
}

export async function laporSelesaiInstruksi(req, res) {
  try {
    const io = getIO();
    const kadinId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { laporan_pelaksanaan } = req.body || {};

    const row = await InstruksiGubernur.findByPk(id);
    if (!row || row.assigned_to !== kadinId) {
      return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    }

    row.status = "selesai";
    row.selesai_at = new Date();
    if (laporan_pelaksanaan) row.laporan_pelaksanaan = laporan_pelaksanaan;
    await row.save();

    if (io) {
      io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:selesai", {
        id: row.id,
        nomor: row.nomor_instruksi,
        judul: row.judul,
        selesai_at: row.selesai_at,
      });
    }

    await NotifikasiGubernur.create({
      user_id: row.created_by,
      jenis: "perintah_selesai",
      judul: "Instruksi selesai",
      isi: `${row.nomor_instruksi || `#${row.id}`} — ${row.judul}`,
      referensi_id: row.id,
      referensi_tabel: "instruksi_gubernur",
      sudah_dibaca: false,
    }).catch(() => null);

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal lapor selesai", error: err.message });
  }
}

