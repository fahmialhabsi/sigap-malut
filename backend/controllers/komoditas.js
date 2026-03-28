// =====================================================
// CONTROLLER: KomoditasController
// MODEL: Komoditas
// Generated: 2026-03-19T23:39:27.525Z
// =====================================================

import Komoditas from '../models/komoditas.js';

// @desc    Get all Komoditas records
// @route   GET /api/komoditas
// @access  Private
export const getAllKomoditas = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Komoditas.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Komoditas',
      error: error.message
    });
  }
};

// @desc    Get single Komoditas by ID
// @route   GET /api/komoditas/:id
// @access  Private
export const getKomoditasById = async (req, res) => {
  try {
    const record = await Komoditas.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Komoditas not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Komoditas',
      error: error.message
    });
  }
};

// @desc    Create new Komoditas
// @route   POST /api/komoditas
// @access  Private
export const createKomoditas = async (req, res) => {
  try {
    const record = await Komoditas.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Komoditas created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Komoditas',
      error: error.message
    });
  }
};

// @desc    Update Komoditas
// @route   PUT /api/komoditas/:id
// @access  Private
export const updateKomoditas = async (req, res) => {
  try {
    const record = await Komoditas.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Komoditas not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Komoditas updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Komoditas',
      error: error.message
    });
  }
};

// @desc    Delete Komoditas
// @route   DELETE /api/komoditas/:id
// @access  Private
export const deleteKomoditas = async (req, res) => {
  try {
    const record = await Komoditas.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Komoditas not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Komoditas deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Komoditas',
      error: error.message
    });
  }
};
