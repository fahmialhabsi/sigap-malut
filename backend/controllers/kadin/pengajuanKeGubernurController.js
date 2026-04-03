import { PengajuanKeGubernur, NotifikasiGubernur } from "../../models/index.js";
import { getIO, ROOMS } from "../../services/socketService.js";
import { getGubernurUserIds } from "../../services/gubernurUserService.js";
import { genNomorPengajuan } from "../gubernur/pengajuanController.js";
import {
  auditExecutiveAction,
  EXEC_AUDIT_MODUL,
} from "../../services/executiveAuditService.js";
import { enqueueSocketDelivery } from "../../services/notificationOutboxService.js";
import { resolvePengajuanExecutionThreadId } from "../../services/executionThreadService.js";

export async function listPengajuanKeGubernurSaya(req, res) {
  try {
    const kadinId = req.user?.id;
    const { limit = 50 } = req.query || {};
    const rows = await PengajuanKeGubernur.findAll({
      where: { submitted_by: kadinId },
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat pengajuan ke Gubernur",
      error: err.message,
    });
  }
}

export async function createPengajuanKeGubernur(req, res) {
  try {
    const kadinId = req.user?.id;
    const {
      judul,
      jenis,
      isi_pengajuan,
      lampiran_url,
      instruksi_id,
    } = req.body || {};

    const j = String(jenis || "").trim();
    const allowedJenis = new Set([
      "persetujuan_kebijakan",
      "persetujuan_anggaran",
      "laporan_strategis",
      "rekomendasi",
      "informasi",
    ]);
    if (!judul || !j || !isi_pengajuan) {
      return res.status(400).json({
        success: false,
        message: "Judul, jenis, dan isi pengajuan wajib diisi.",
      });
    }
    if (!allowedJenis.has(j)) {
      return res.status(400).json({
        success: false,
        message: "Jenis pengajuan tidak valid.",
      });
    }

    const nomor_pengajuan = await genNomorPengajuan();
    const execution_thread_id = await resolvePengajuanExecutionThreadId(
      instruksi_id ? Number(instruksi_id) : null,
    );
    const row = await PengajuanKeGubernur.create({
      nomor_pengajuan,
      judul: String(judul).trim().slice(0, 255),
      jenis: j,
      isi_pengajuan: String(isi_pengajuan).trim(),
      lampiran_url: lampiran_url ? String(lampiran_url).slice(0, 500) : null,
      submitted_by: kadinId,
      instruksi_id: instruksi_id ? Number(instruksi_id) : null,
      execution_thread_id,
      status: "diajukan",
    });

    const io = getIO();
    const govIds = await getGubernurUserIds();
    for (const gid of govIds) {
      await NotifikasiGubernur.create({
        user_id: gid,
        jenis: "pengajuan_masuk",
        judul: `Pengajuan strategis: ${row.judul}`,
        isi: `${row.nomor_pengajuan} — menunggu keputusan Anda.`,
        referensi_id: row.id,
        referensi_tabel: "pengajuan_ke_gubernur",
        sudah_dibaca: false,
      }).catch(() => null);
    }

    const sock = { id: row.id, nomor: row.nomor_pengajuan, judul: row.judul };
    try {
      if (io) io.to(ROOMS.GUBERNUR).emit("gubernur:pengajuan:baru", sock);
    } catch {
      void enqueueSocketDelivery({
        eventKey: `peng-baru|${row.id}|${Date.now()}`,
        room: ROOMS.GUBERNUR,
        event: "gubernur:pengajuan:baru",
        data: sock,
      });
    }

    void auditExecutiveAction({
      modul: EXEC_AUDIT_MODUL.PENGAJUAN_KE_GUBERNUR,
      entitas_id: row.id,
      aksi: "CREATE_DIAJUKAN",
      pegawai_id: kadinId,
      data_lama: null,
      data_baru: row.get({ plain: true }),
    });

    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim pengajuan ke Gubernur",
      error: err.message,
    });
  }
}
