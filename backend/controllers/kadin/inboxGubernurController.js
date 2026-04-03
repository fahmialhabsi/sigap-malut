import { Op } from "sequelize";
import { InstruksiGubernur, NotifikasiGubernur, Task } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";
import { runAutoCompleteInstruksiForKadin } from "../../services/kadinInstruksiAutoService.js";
import {
  auditExecutiveAction,
  EXEC_AUDIT_MODUL,
} from "../../services/executiveAuditService.js";
import { enqueueSocketDelivery } from "../../services/notificationOutboxService.js";

export async function listInboxGubernur(req, res) {
  try {
    const kadinId = req.user?.id;
    const { status, jenis, limit = 50 } = req.query || {};
    const where = { assigned_to: kadinId };
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;

    await runAutoCompleteInstruksiForKadin(kadinId).catch(() => null);

    const rows = await InstruksiGubernur.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    const tasks = await Task.findAll({ where: { created_by: kadinId } }).catch(
      () => [],
    );

    const data = rows.map((row) => {
      const j = row.toJSON ? row.toJSON() : row;
      const turunan = tasks.filter(
        (t) =>
          Number(t.metadata?.sumber_instruksi_gubernur_id) === Number(j.id),
      );
      const turunan_count = turunan.length;
      const turunan_all_closed =
        turunan_count > 0 &&
        turunan.every(
          (t) => String(t.status || "").toLowerCase() === "closed",
        );
      return {
        ...j,
        turunan_count,
        turunan_all_closed,
        lapor_selesai_otomatis: turunan_count > 0,
      };
    });

    return res.json({ success: true, data });
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

    const sebelum = row.get({ plain: true });

    // Status: DITERBITKAN -> DIBACA
    if (row.status === "diterbitkan") {
      row.status = "dibaca";
      row.dibaca_at = new Date();
      await row.save();
    }

    const sock = {
      id: row.id,
      nomor: row.nomor_instruksi,
      judul: row.judul,
      dibaca_at: row.dibaca_at,
    };
    try {
      if (io) io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:dibaca", sock);
    } catch {
      void enqueueSocketDelivery({
        eventKey: `instr-dibaca|${row.id}|${Date.now()}`,
        room: ROOMS.GUBERNUR,
        event: "gubernur:instruksi:dibaca",
        data: sock,
      });
    }

    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.KADIN_INBOX,
      entitas_id: row.id,
      aksi: "KONFIRMASI_TERIMA",
      pegawai_id: kadinId,
      data_lama: sebelum,
      data_baru: row.get({ plain: true }),
    });

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

    const sebelum = row.get({ plain: true });

    row.status = "selesai";
    row.selesai_at = new Date();
    if (laporan_pelaksanaan) row.laporan_pelaksanaan = laporan_pelaksanaan;
    await row.save();

    const sock2 = {
      id: row.id,
      nomor: row.nomor_instruksi,
      judul: row.judul,
      selesai_at: row.selesai_at,
    };
    try {
      if (io) io.to(ROOMS.GUBERNUR).emit("gubernur:instruksi:selesai", sock2);
    } catch {
      void enqueueSocketDelivery({
        eventKey: `instr-selesai|${row.id}|${Date.now()}`,
        room: ROOMS.GUBERNUR,
        event: "gubernur:instruksi:selesai",
        data: sock2,
      });
    }

    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.KADIN_INBOX,
      entitas_id: row.id,
      aksi: "LAPOR_SELESAI",
      pegawai_id: kadinId,
      data_lama: sebelum,
      data_baru: row.get({ plain: true }),
    });

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

