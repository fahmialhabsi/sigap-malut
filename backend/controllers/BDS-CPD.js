// =====================================================
// CONTROLLER: BdsCpdController
// MODEL: BdsCpd
// Generated: 2026-02-17T19:24:48.387Z
// =====================================================

import * as komoditasService from "../services/komoditasService.js";

// @desc    Get all BdsCpd records
// @route   GET /api/bds-cpd
// @access  Private
export const getAllBdsCpd = async (req, res) => {
  try {
    try {
      const data = await komoditasService.getAllKomoditas();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching Komoditas",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsCpd",
      error: error.message,
    });
  }
};

// @desc    Get single BdsCpd by ID
// @route   GET /api/bds-cpd/:id
// @access  Private
export const getBdsCpdById = async (req, res) => {
  try {
    try {
      const record = await komoditasService.getKomoditasById(req.params.id);
      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "Komoditas not found" });
      }
      res.json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching Komoditas",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsCpd",
      error: error.message,
    });
  }
};

// @desc    Create new BdsCpd
// @route   POST /api/bds-cpd
// @access  Private
export const createBdsCpd = async (req, res) => {
  try {
    try {
      const record = await komoditasService.createKomoditas({
        ...req.body,
        created_by: req.user?.id,
      });
      await logAudit({
        modul: "BDS-CPD",
        entitas_id: record.id,
        aksi: "CREATE",
        data_lama: null,
        data_baru: record,
        pegawai_id: req.user?.id || null,
      });
      res.status(201).json({
        success: true,
        message: "Komoditas created successfully",
        data: record,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error creating Komoditas",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsCpd",
      error: error.message,
    });
  }
};

// @desc    Update BdsCpd
// @route   PUT /api/bds-cpd/:id
// @access  Private
export const updateBdsCpd = async (req, res) => {
  try {
    try {
      const record = await komoditasService.getKomoditasById(req.params.id);
      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "Komoditas not found" });
      }
      await komoditasService.updateKomoditas(req.params.id, {
        ...req.body,
        updated_by: req.user?.id,
      });
      const updated = await komoditasService.getKomoditasById(req.params.id);
      await logAudit({
        modul: "BDS-CPD",
        entitas_id: updated.id,
        aksi: "UPDATE",
        data_lama: record,
        data_baru: updated,
        pegawai_id: req.user?.id || null,
      });
      res.json({
        success: true,
        message: "Komoditas updated successfully",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error updating Komoditas",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BdsCpd",
      error: error.message,
    });
  }
};

// @desc    Delete BdsCpd
// @route   DELETE /api/bds-cpd/:id
// @access  Private
export const deleteBdsCpd = async (req, res) => {
  try {
    try {
      const record = await komoditasService.getKomoditasById(req.params.id);
      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "Komoditas not found" });
      }
      await komoditasService.deleteKomoditas(req.params.id);
      // Audit trail
      await logAudit({
        modul: "BDS-CPD",
        entitas_id: req.params.id,
        aksi: "DELETE",
        data_lama: record,
        data_baru: null,
        pegawai_id: req.user?.id || null,
      });
      res.json({ success: true, message: "Komoditas deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting Komoditas",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BdsCpd",
      error: error.message,
    });
  }
};
