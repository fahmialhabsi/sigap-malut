// =====================================================
// CONTROLLER: BksEvlController
// MODEL: BksEvl
// Generated: 2026-02-17T19:24:48.394Z
// =====================================================

import BksEvl from "../models/BKS-EVL.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BksEvl records
// @route   GET /api/bks-evl
// @access  Private
export const getAllBksEvl = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = { ...filters };

    const { count, rows } = await BksEvl.findAndCountAll({
      where: whereClause,
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
      message: "Error fetching BksEvl",
      error: error.message,
    });
  }
};

// @desc    Get single BksEvl by ID
// @route   GET /api/bks-evl/:id
// @access  Private
export const getBksEvlById = async (req, res) => {
  try {
    const record = await BksEvl.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksEvl not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BksEvl",
      error: error.message,
    });
  }
};

// @desc    Create new BksEvl
// @route   POST /api/bks-evl
// @access  Private
export const createBksEvl = async (req, res) => {
  try {
    const record = await BksEvl.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-EVL",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BksEvl created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BksEvl",
      error: error.message,
    });
  }
};

// @desc    Update BksEvl
// @route   PUT /api/bks-evl/:id
// @access  Private
export const updateBksEvl = async (req, res) => {
  try {
    const record = await BksEvl.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksEvl not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-EVL",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksEvl updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BksEvl",
      error: error.message,
    });
  }
};

// @desc    Delete BksEvl
// @route   DELETE /api/bks-evl/:id
// @access  Private
export const deleteBksEvl = async (req, res) => {
  try {
    const record = await BksEvl.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksEvl not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKS-EVL",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksEvl deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BksEvl",
      error: error.message,
    });
  }
};

// @desc    Get KPI summary for Dashboard Konsumsi (latest record by unit_kerja)
// @route   GET /api/bks-evl/summary
// @access  Private
export const getBksEvlSummary = async (req, res) => {
  try {
    const unitKerjaRaw =
      req.user?.unit_kerja || req.user?.unit_id || "Bidang Konsumsi";

    // lebih toleran: match sebagian (case-insensitive)
    const record = await BksEvl.findOne({
      where: { unit_kerja: unitKerjaRaw },
      order: [["created_at", "DESC"]],
    });

    if (!record) {
      return res.json({
        success: true,
        data: {
          konsumsi_pangan: {
            energi_kkal_per_kapita: null,
            protein_g_per_kapita: null,
          },
          skor_pph: {
            capaian: null,
            target: null,
            status: null,
          },
          meta: {
            source: "bks_evl",
            hasData: false,
            filter_unit_kerja: unitKerjaRaw,
          },
        },
      });
    }

    const energi = record.konsumsi_energi_per_kapita ?? null;
    const protein = record.konsumsi_protein_per_kapita ?? null;

    const capaian = record.skor_pph_capaian ?? null;
    const target = record.skor_pph_target ?? null;

    const status =
      capaian == null || target == null
        ? null
        : Number(capaian) >= Number(target)
          ? "On Target"
          : "Di Bawah Target";

    return res.json({
      success: true,
      data: {
        konsumsi_pangan: {
          energi_kkal_per_kapita: energi,
          protein_g_per_kapita: protein,
        },
        skor_pph: { capaian, target, status },
        meta: {
          source: "bks_evl",
          hasData: true,
          filter_unit_kerja: unitKerjaRaw,
          record_id: record.id,
          periode: record.periode ?? null,
          tahun: record.tahun ?? null,
          bulan: record.bulan ?? null,
          triwulan: record.triwulan ?? null,
          semester: record.semester ?? null,
          created_at: record.created_at ?? null,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching BksEvl summary",
      error: error.message,
    });
  }
};
