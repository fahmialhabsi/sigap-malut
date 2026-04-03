import { Op } from "sequelize";
import { InstruksiGubernur, NotifikasiGubernur } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";
import { getDefaultKepalaDinasUserId } from "../../services/gubernurUserService.js";
import {
  computeDefaultDeadline,
  generateJudulFromIsi,
} from "../../services/instruksiDeadlineService.js";
import {
  auditExecutiveAction,
  EXEC_AUDIT_MODUL,
} from "../../services/executiveAuditService.js";
function pad3(n) {
  return String(n).padStart(3, "0");
}

async function genNomorInstruksi() {
  const now = new Date();
  const tahun = now.getFullYear();
  const prefix = `INS-${tahun}-`;
  const last = await InstruksiGubernur.findOne({
    where: { nomor_instruksi: { [Op.like]: `${prefix}%` } },
    order: [["id", "DESC"]],
  });
  const lastNo = last?.nomor_instruksi || "";
  const m = lastNo.match(/INS-\d{4}-(\d+)/);
  const next = (m ? parseInt(m[1], 10) : 0) + 1;
  return `${prefix}${pad3(next)}`;
}

export async function createInstruksi(req, res) {
  try {
    const gubernurId = req.user?.id;
    const {
      judul,
      isi_perintah,
      jenis,
      prioritas = "normal",
      deadline,
      deadline_manual,
      lampiran_url,
      assigned_to, // opsional — default Kepala Dinas Pangan (satu akun)
    } = req.body || {};

    if (!isi_perintah || !jenis) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: isi_perintah, jenis",
      });
    }

    let penerimaId =
      assigned_to != null && String(assigned_to).trim() !== ""
        ? Number(assigned_to)
        : null;
    if (penerimaId == null || !Number.isFinite(penerimaId)) {
      penerimaId = await getDefaultKepalaDinasUserId();
    }
    if (penerimaId == null || !Number.isFinite(penerimaId)) {
      return res.status(400).json({
        success: false,
        message:
          "Belum ada akun Kepala Dinas aktif — tidak dapat menetapkan penerima instruksi.",
      });
    }

    const judulFinal =
      String(judul || "").trim() || generateJudulFromIsi(isi_perintah);
    const explicitManual = deadline_manual === true;
    const deadlineFinal = explicitManual
      ? deadline && String(deadline).trim() !== ""
        ? String(deadline).slice(0, 10)
        : null
      : computeDefaultDeadline(jenis, prioritas);

    const nomor_instruksi = await genNomorInstruksi();

    const row = await InstruksiGubernur.create({
      nomor_instruksi,
      judul: judulFinal.slice(0, 255),
      isi_perintah,
      jenis,
      prioritas,
      deadline: deadlineFinal,
      lampiran_url: lampiran_url || null,
      created_by: gubernurId,
      assigned_to: penerimaId,
      status: "draf",
    });

    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.INSTRUKSI,
      entitas_id: row.id,
      aksi: "CREATE_DRAF",
      pegawai_id: gubernurId,
      data_lama: null,
      data_baru: row.get({ plain: true }),
    });

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal buat instruksi", error: err.message });
  }
}

export async function listInstruksi(req, res) {
  try {
    const { status, jenis, q, limit = 50 } = req.query || {};
    const where = {};
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;
    if (q) {
      where[Op.or] = [
        { judul: { [Op.iLike]: `%${q}%` } },
        { nomor_instruksi: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const rows = await InstruksiGubernur.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil instruksi", error: err.message });
  }
}

export async function getInstruksiDetail(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await InstruksiGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil detail instruksi", error: err.message });
  }
}

export async function updateStatusInstruksi(req, res) {
  try {
    const io = getIO();
    const gubernurId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { status, laporan_pelaksanaan } = req.body || {};

    const row = await InstruksiGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });

    const sebelum = row.get({ plain: true });

    // Hanya Gubernur yang boleh publish/close/hapus; status lainnya dipakai di Prompt 2 (aksi Kadin)
    if (status === "diterbitkan") {
      if (row.status !== "draf") {
        return res.status(400).json({ success: false, message: "Hanya instruksi status draf yang bisa diterbitkan" });
      }
      row.status = "diterbitkan";

      // Notifikasi ke Kepala Dinas (room) & notifikasi gubernur (log)
      if (io) {
        io.to(ROOMS.KADIN).emit("gubernur:instruksi:baru", { id: row.id, nomor: row.nomor_instruksi, judul: row.judul });
      }
      await NotifikasiGubernur.create({
        user_id: gubernurId,
        jenis: "laporan_tersedia",
        judul: "Instruksi diterbitkan",
        isi: `${row.nomor_instruksi} — ${row.judul}`,
        referensi_id: row.id,
        referensi_tabel: "instruksi_gubernur",
        sudah_dibaca: true,
      }).catch(() => null);
    } else if (status === "selesai") {
      row.status = "selesai";
      row.selesai_at = new Date();
      if (laporan_pelaksanaan) row.laporan_pelaksanaan = laporan_pelaksanaan;
    } else if (status === "draf") {
      row.status = "draf";
    } else {
      return res.status(400).json({ success: false, message: "Status tidak didukung dari sisi Gubernur (MVP)" });
    }

    await row.save();

    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.INSTRUKSI,
      entitas_id: row.id,
      aksi: `UPDATE_STATUS_${String(status || "").toUpperCase()}`,
      pegawai_id: gubernurId,
      data_lama: sebelum,
      data_baru: row.get({ plain: true }),
    });

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update status instruksi", error: err.message });
  }
}

export async function deleteInstruksi(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await InstruksiGubernur.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "Instruksi tidak ditemukan" });
    if (row.status !== "draf") {
      return res.status(400).json({ success: false, message: "Hanya instruksi status draf yang boleh dihapus" });
    }
    const snap = row.get({ plain: true });
    const pid = req.user?.id;
    await row.destroy();
    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.INSTRUKSI,
      entitas_id: id,
      aksi: "DELETE_DRAF",
      pegawai_id: pid,
      data_lama: snap,
      data_baru: null,
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal hapus instruksi", error: err.message });
  }
}

