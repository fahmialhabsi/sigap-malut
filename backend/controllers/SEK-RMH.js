// =====================================================
// CONTROLLER: SekRmhController
// MODEL: SekRmh
// Generated: 2026-02-17T19:24:48.414Z
// =====================================================

import SekRmh from "../models/SEK-RMH.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all SekRmh records
// @route   GET /api/sek-rmh
// @access  Private
export const getAllSekRmh = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await SekRmh.findAndCountAll({
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
      message: "Error fetching SekRmh",
      error: error.message,
    });
  }
};

// @desc    Get single SekRmh by ID
// @route   GET /api/sek-rmh/:id
// @access  Private
export const getSekRmhById = async (req, res) => {
  try {
    const record = await SekRmh.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekRmh not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SekRmh",
      error: error.message,
    });
  }
};

// @desc    Create new SekRmh
// @route   POST /api/sek-rmh
// @access  Private
export const createSekRmh = async (req, res) => {
  try {
    const record = await SekRmh.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-RMH",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "SekRmh created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating SekRmh",
      error: error.message,
    });
  }
};

// @desc    Update SekRmh
// @route   PUT /api/sek-rmh/:id
// @access  Private
export const updateSekRmh = async (req, res) => {
  try {
    const record = await SekRmh.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekRmh not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-RMH",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekRmh updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating SekRmh",
      error: error.message,
    });
  }
};

// @desc    Delete SekRmh
// @route   DELETE /api/sek-rmh/:id
// @access  Private
export const deleteSekRmh = async (req, res) => {
  try {
    const record = await SekRmh.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekRmh not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "SEK-RMH",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekRmh deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SekRmh",
      error: error.message,
    });
  }
};
