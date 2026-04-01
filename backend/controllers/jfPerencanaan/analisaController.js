import { Op } from "sequelize";
import AnalisaPerencanaan from "../../models/AnalisaPerencanaan.js";

function nowYear() {
  return new Date().getFullYear();
}

async function generateNomorAnalisa() {
  const year = nowYear();
  const prefix = `ANL-REN-${year}-`;
  const latest = await AnalisaPerencanaan.findOne({
    where: { nomor_analisa: { [Op.like]: `${prefix}%` } },
    order: [["id", "DESC"]],
  });
  const lastNo = latest?.nomor_analisa
    ? parseInt(String(latest.nomor_analisa).split("-").pop(), 10)
    : 0;
  const next = String((lastNo || 0) + 1).padStart(3, "0");
  return `${prefix}${next}`;
}

export async function createAnalisa(req, res) {
  try {
    const userId = req.user?.id;
    const {
      judul,
      jenis_analisa,
      dokumen_input_url,
      sumber_data_epelara,
      periode_tahun,
      periode_triwulan,
      catatan_teknis,
      rekomendasi,
      temuan_cascading,
      skor_kesesuaian_rpjmd,
      dokumen_hasil_url,
      tujuan_submit,
      task_id,
    } = req.body || {};

    if (!judul || !jenis_analisa) {
      return res.status(400).json({
        success: false,
        message: "judul dan jenis_analisa wajib diisi",
      });
    }

    const nomor = await generateNomorAnalisa();
    const row = await AnalisaPerencanaan.create({
      nomor_analisa: nomor,
      judul,
      jenis_analisa,
      dokumen_input_url: dokumen_input_url || null,
      sumber_data_epelara: sumber_data_epelara || null,
      periode_tahun: periode_tahun ?? null,
      periode_triwulan: periode_triwulan ?? null,
      catatan_teknis: catatan_teknis || null,
      rekomendasi: rekomendasi || null,
      temuan_cascading: temuan_cascading || null,
      skor_kesesuaian_rpjmd: skor_kesesuaian_rpjmd ?? null,
      dokumen_hasil_url: dokumen_hasil_url || null,
      tujuan_submit: tujuan_submit || "sekretaris",
      status: "draft",
      task_id: task_id ?? null,
      dibuat_oleh: userId,
    });

    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat analisa perencanaan",
      error: err.message,
    });
  }
}

export async function listAnalisaSaya(req, res) {
  try {
    const userId = req.user?.id;
    const { status, jenis, limit = 50 } = req.query;
    const where = { dibuat_oleh: userId };
    if (status) where.status = String(status);
    if (jenis) where.jenis_analisa = String(jenis);

    const rows = await AnalisaPerencanaan.findAll({
      where,
      order: [["updated_at", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 50, 200),
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat analisa",
      error: err.message,
    });
  }
}

export async function getAnalisaById(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await AnalisaPerencanaan.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Analisa tidak ditemukan" });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail analisa", error: err.message });
  }
}

export async function updateDraft(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await AnalisaPerencanaan.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Analisa tidak ditemukan" });
    }
    if (row.status !== "draft") {
      return res.status(400).json({ success: false, message: "Hanya draft yang bisa diedit" });
    }

    await row.update({ ...req.body, updated_at: new Date() });
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update analisa", error: err.message });
  }
}

export async function submitAnalisa(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { tujuan_submit, catatan_teknis, rekomendasi, dokumen_hasil_url } = req.body || {};
    const row = await AnalisaPerencanaan.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Analisa tidak ditemukan" });
    }

    const tujuan = tujuan_submit || row.tujuan_submit || "sekretaris";
    const nextStatus =
      tujuan === "kasubag" ? "diajukan_ke_kasubag" : "diajukan_ke_sekretaris";

    await row.update({
      tujuan_submit: tujuan,
      status: nextStatus,
      catatan_teknis: catatan_teknis ?? row.catatan_teknis,
      rekomendasi: rekomendasi ?? row.rekomendasi,
      dokumen_hasil_url: dokumen_hasil_url ?? row.dokumen_hasil_url,
    });

    return res.json({ success: true, data: row, message: "Analisa diajukan" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit analisa", error: err.message });
  }
}

export async function listDikembalikan(req, res) {
  try {
    const userId = req.user?.id;
    const rows = await AnalisaPerencanaan.findAll({
      where: {
        dibuat_oleh: userId,
        status: { [Op.in]: ["dikembalikan_sekretaris", "dikembalikan_kasubag"] },
      },
      order: [["updated_at", "DESC"]],
      limit: 50,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil dikembalikan", error: err.message });
  }
}

export async function submitRevisi(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { catatan_respons, dokumen_hasil_url } = req.body || {};
    const row = await AnalisaPerencanaan.findByPk(id);
    if (!row || row.dibuat_oleh !== userId) {
      return res.status(404).json({ success: false, message: "Analisa tidak ditemukan" });
    }
    if (!["dikembalikan_sekretaris", "dikembalikan_kasubag"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "Analisa ini tidak dalam status dikembalikan" });
    }
    if (!catatan_respons) {
      return res.status(400).json({ success: false, message: "catatan_respons wajib diisi" });
    }

    const tujuan = row.tujuan_submit || "sekretaris";
    const nextStatus =
      tujuan === "kasubag" ? "diajukan_ke_kasubag" : "diajukan_ke_sekretaris";

    const existingNotes = row.catatan_teknis ? `${row.catatan_teknis}\n\n` : "";
    await row.update({
      revisi_ke: (row.revisi_ke || 0) + 1,
      status: nextStatus,
      catatan_teknis: `${existingNotes}— Revisi: ${catatan_respons}`,
      dokumen_hasil_url: dokumen_hasil_url ?? row.dokumen_hasil_url,
    });

    return res.json({ success: true, data: row, message: "Revisi diajukan ulang" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit revisi", error: err.message });
  }
}

