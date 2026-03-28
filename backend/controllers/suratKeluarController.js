import SuratKeluar from "../models/SuratKeluar.js";
import Disposisi from "../models/Disposisi.js";
import AgendaSurat from "../models/AgendaSurat.js";
import ArsipSurat from "../models/ArsipSurat.js";
import {
  generateNomorSuratKeluar,
  generateArsipCode,
} from "../utils/suratUtils.js";

// POST /api/surat/keluar
export const createSuratKeluar = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      jenis_naskah,
      tanggal_surat,
      kepada,
      tembusan,
      perihal,
      isi_surat,
      dasar,
      template_id,
      penandatangan,
      jabatan_ttd,
      status = "draft",
      keterangan,
      unit_pembuat,
    } = req.body;

    if (!jenis_naskah || !tanggal_surat || !kepada || !perihal) {
      return res.status(400).json({
        success: false,
        message: "jenis_naskah, tanggal_surat, kepada, dan perihal wajib diisi.",
      });
    }

    const fileDraft = req.file ? req.file.path : null;

    // Generate nomor surat jika bukan draft
    let nomor_surat = null;
    if (status !== "draft") {
      nomor_surat = await generateNomorSuratKeluar(jenis_naskah);
    }

    const arsipCode = generateArsipCode(perihal);

    const surat = await SuratKeluar.create({
      nomor_surat,
      jenis_naskah,
      tanggal_surat,
      kepada,
      tembusan: tembusan ? (Array.isArray(tembusan) ? tembusan : [tembusan]) : null,
      perihal,
      isi_surat: isi_surat || null,
      dasar: dasar || null,
      template_id: template_id || null,
      file_draft: fileDraft,
      penandatangan: penandatangan || null,
      jabatan_ttd: jabatan_ttd || null,
      status,
      arsip_code: arsipCode,
      keterangan: keterangan || null,
      dibuat_oleh: userId,
      unit_pembuat: unit_pembuat || req.user.unit_kerja || null,
    });

    return res.status(201).json({
      success: true,
      data: surat,
      message: "Surat keluar berhasil dibuat.",
    });
  } catch (error) {
    console.error("[createSuratKeluar]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal membuat surat keluar." });
  }
};

// GET /api/surat/keluar
export const getAllSuratKeluar = async (req, res) => {
  try {
    const { status, jenis_naskah, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (jenis_naskah) where.jenis_naskah = jenis_naskah;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await SuratKeluar.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error("[getAllSuratKeluar]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data surat keluar." });
  }
};

// GET /api/surat/keluar/:id
export const getSuratKeluarById = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat keluar tidak ditemukan." });
    }
    return res.json({ success: true, data: surat });
  } catch (error) {
    console.error("[getSuratKeluarById]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil detail surat keluar." });
  }
};

// PUT /api/surat/keluar/:id
export const updateSuratKeluar = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat keluar tidak ditemukan." });
    }

    const allowedFields = [
      "jenis_naskah",
      "tanggal_surat",
      "kepada",
      "tembusan",
      "perihal",
      "isi_surat",
      "dasar",
      "template_id",
      "penandatangan",
      "jabatan_ttd",
      "tanggal_ttd",
      "keterangan",
      "unit_pembuat",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.perihal) {
      updateData.arsip_code = generateArsipCode(updateData.perihal);
    }

    await surat.update(updateData);

    return res.json({
      success: true,
      data: surat,
      message: "Surat keluar berhasil diperbarui.",
    });
  } catch (error) {
    console.error("[updateSuratKeluar]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui surat keluar." });
  }
};

// PUT /api/surat/keluar/:id/submit
export const submitSuratKeluar = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat keluar tidak ditemukan." });
    }

    if (surat.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Hanya surat dengan status draft yang dapat disubmit.",
      });
    }

    await surat.update({ status: "review" });

    return res.json({
      success: true,
      data: surat,
      message: "Surat keluar berhasil disubmit untuk review.",
    });
  } catch (error) {
    console.error("[submitSuratKeluar]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal submit surat keluar." });
  }
};

// PUT /api/surat/keluar/:id/approve
export const approveSuratKeluar = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) {
      return res
        .status(404)
        .json({ success: false, message: "Surat keluar tidak ditemukan." });
    }

    if (surat.status !== "review") {
      return res.status(400).json({
        success: false,
        message: "Hanya surat dengan status review yang dapat diapprove.",
      });
    }

    // Generate nomor surat final
    const nomor_surat = await generateNomorSuratKeluar(surat.jenis_naskah);

    // Buat record agenda surat
    const now = new Date();
    await AgendaSurat.create({
      nomor_agenda: nomor_surat,
      jenis: "keluar",
      referensi_id: surat.id,
      tanggal: now.toISOString().split("T")[0],
      perihal: surat.perihal,
      dari_kepada: surat.kepada,
      kode_klasifikasi: surat.arsip_code,
      tahun: now.getFullYear(),
      bulan: now.getMonth() + 1,
    });

    await surat.update({ status: "approved", nomor_surat });

    return res.json({
      success: true,
      data: surat,
      message: "Surat keluar berhasil diapprove dan nomor surat digenerate.",
    });
  } catch (error) {
    console.error("[approveSuratKeluar]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal approve surat keluar." });
  }
};

// GET /api/surat/dashboard/stats
export const getDashboardStatsSurat = async (req, res) => {
  try {
    const [totalMasuk, totalKeluar, pendingDisposisi, totalArsip] =
      await Promise.all([
        SuratMasuk.count(),
        SuratKeluar.count(),
        Disposisi.count({ where: { status: "belum_dibaca" } }),
        ArsipSurat.count(),
      ]);

    const suratMasukByStatus = await SuratMasuk.findAll({
      attributes: [
        "status",
        [
          SuratMasuk.sequelize.fn("COUNT", SuratMasuk.sequelize.col("id")),
          "count",
        ],
      ],
      group: ["status"],
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        totalMasuk,
        totalKeluar,
        pendingDisposisi,
        totalArsip,
        suratMasukByStatus,
      },
    });
  } catch (error) {
    console.error("[getDashboardStatsSurat]", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil statistik surat." });
  }
};
