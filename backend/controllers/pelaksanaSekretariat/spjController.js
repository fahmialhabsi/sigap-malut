import { Op } from "sequelize";
import Spj from "../../models/Spj.js";
import { gateOperationalWrite, gateOperationalUpdate } from "../../services/executionThreadGate.js";

function ensureOwner(row, userId) {
  return row && Number(row.dibuat_oleh) === Number(userId);
}

export async function listSpjSaya(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const rows = await Spj.findAll({
      where: { dibuat_oleh: userId },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ saya", error: err.message });
  }
}

export async function getSpjDetail(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SPJ", error: err.message });
  }
}

export async function createSpj(req, res) {
  try {
    const threadOk = await gateOperationalWrite(req, res);
    if (!threadOk) return;
    const userId = req.user?.id;
    const body = req.body || {};

    const row = await Spj.create({
      nomor_spj: body.nomor_spj || null,
      jenis_belanja: body.jenis_belanja,
      sub_kegiatan_kode: body.sub_kegiatan_kode || "SEKRETARIAT",
      kode_rekening: body.kode_rekening || "5.2.2.11.01",
      nominal: body.nominal || 0,
      keterangan: body.keterangan || null,
      dibuat_oleh: userId,
      tanggal_kegiatan: body.tanggal_kegiatan || new Date(),
      lampiran_url: body.lampiran_url || null,
      status: "draft",
      revisi_ke: 0,
      jenis_bendahara: "pengeluaran",
      execution_thread_id: req.body.execution_thread_id ?? null,
      task_id:
        req.body.task_id != null && Number.isFinite(Number(req.body.task_id))
          ? Number(req.body.task_id)
          : null,
    });

    return res.json({ success: true, message: "SPJ draft dibuat", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal membuat SPJ", error: err.message });
  }
}

export async function updateSpj(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    const threadUp = await gateOperationalUpdate(req, res, row);
    if (!threadUp) return;
    if (!["draft", "dikembalikan_bendahara", "dikembalikan_ppk"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "SPJ tidak bisa diubah pada status ini" });
    }
    const body = req.body || {};
    for (const k of ["jenis_belanja", "sub_kegiatan_kode", "kode_rekening", "nominal", "keterangan", "tanggal_kegiatan", "lampiran_url"]) {
      if (body[k] != null) row[k] = body[k];
    }
    await row.save();
    return res.json({ success: true, message: "SPJ diperbarui", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update SPJ", error: err.message });
  }
}

export async function submitKeBendahara(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    if (!["draft", "dikembalikan_bendahara", "dikembalikan_ppk"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "SPJ tidak bisa disubmit pada status ini" });
    }

    row.status = "diajukan_ke_bendahara";
    await row.save();
    return res.json({ success: true, message: "SPJ dikirim ke Bendahara Pengeluaran", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit SPJ", error: err.message });
  }
}

export async function listSpjDikembalikan(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await Spj.findAll({
      where: { dibuat_oleh: userId, status: { [Op.in]: ["dikembalikan_bendahara", "dikembalikan_ppk"] } },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ dikembalikan", error: err.message });
  }
}

