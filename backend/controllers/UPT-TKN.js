// =====================================================
// CONTROLLER: UptTknController
// MODEL: UptTkn
// Generated: 2026-02-17T19:24:48.418Z
// =====================================================

import UptTkn from "../models/UPT-TKN.js";

// @desc    Get all UptTkn records
// @route   GET /api/upt-tkn
// @access  Private
export const getAllUptTkn = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await UptTkn.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UptTkn",
      error: error.message,
    });
  }
};

// @desc    Get single UptTkn by ID
// @route   GET /api/upt-tkn/:id
// @access  Private
export const getUptTknById = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UptTkn",
      error: error.message,
    });
  }
};

// @desc    Create new UptTkn
// @route   POST /api/upt-tkn
// @access  Private
export const createUptTkn = async (req, res) => {
  try {
    // Debug log: cek isi req.body dan req.files
    console.log("[UPT-TKN] req.body:", req.body);
    console.log("[UPT-TKN] req.files:", req.files);

    // Filter hanya field string/number dari req.body
    const allowedFields = [
      "layanan_id",
      "jenis_layanan_teknis",
      "tanggal_pengujian",
      "pemohon",
      "instansi_pemohon",
      "jenis_sampel",
      "jumlah_sampel",
      "parameter_uji",
      "metode_uji",
      "hasil_uji",
      "kesimpulan_uji",
      "rekomendasi_uji",
      "standar_acuan",
      "analis",
      "verifikator",
      "tanggal_verifikasi",
      "jenis_sertifikasi",
      "nama_usaha",
      "jenis_usaha",
      "alamat_usaha",
      "pemilik_usaha",
      "kontak_usaha",
      "tanggal_audit",
      "tim_auditor",
      "checklist_audit",
      "skor_audit",
      "hasil_audit",
      "catatan_audit",
      "tindakan_korektif",
      "batas_waktu_perbaikan",
      "status_sertifikat",
      "tanggal_terbit_sertifikat",
      "masa_berlaku_sertifikat",
      "jenis_produk_audit",
      "negara_asal",
      "dokumen_pendukung",
      "periode_laporan",
      "jenis_laporan",
      "total_pengujian",
      "total_audit",
      "total_sertifikat",
      "persentase_kelulusan",
      "ringkasan_laporan",
      "rincian_layanan",
      "penanggung_jawab",
      "pelaksana",
      "kelompok_penerima",
      "jenis_data",
      "is_sensitive",
      "status",
      "keterangan",
    ];
    const data = {};
    for (const key of allowedFields) {
      if (typeof req.body[key] !== "undefined") {
        data[key] = req.body[key];
      }
    }
    // Konversi otomatis field number dan JSON
    const numberFields = [
      "jumlah_sampel",
      "skor_audit",
      "total_pengujian",
      "total_audit",
      "total_sertifikat",
      "persentase_kelulusan",
    ];
    const jsonFields = ["checklist_audit", "dokumen_pendukung"];
    for (const key of numberFields) {
      if (
        typeof data[key] !== "undefined" &&
        data[key] !== null &&
        data[key] !== ""
      ) {
        data[key] = Number(data[key]);
        if (isNaN(data[key])) data[key] = 0;
      }
    }
    for (const key of jsonFields) {
      if (typeof data[key] === "string" && data[key].trim() !== "") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch {
          // Jika gagal parse, simpan sebagai string
        }
      }
    }
    data.created_by = req.user?.id;
    // Debug log
    console.log("[UPT-TKN] filtered data for create:", data);
    const record = await UptTkn.create(data);
    // Audit trail
    await logAudit({
      action: "create",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Created UptTkn",
      payload: req.body,
    });
    res.status(201).json({
      success: true,
      message: "UptTkn created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating UptTkn",
      error: error.message,
    });
  }
};

// @desc    Update UptTkn
// @route   PUT /api/upt-tkn/:id
// @access  Private
export const updateUptTkn = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "update",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Updated UptTkn",
      payload: req.body,
    });
    res.json({
      success: true,
      message: "UptTkn updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating UptTkn",
      error: error.message,
    });
  }
};

// @desc    Delete UptTkn
// @route   DELETE /api/upt-tkn/:id
// @access  Private
export const deleteUptTkn = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    await record.destroy();
    // Audit trail
    await logAudit({
      action: "delete",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Deleted UptTkn",
      payload: record,
    });
    res.json({
      success: true,
      message: "UptTkn deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting UptTkn",
      error: error.message,
    });
  }
};
