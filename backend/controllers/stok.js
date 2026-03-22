// =====================================================
// CONTROLLER: StokController
// MODEL: Stok
// Generated: 2026-03-19T23:39:27.556Z
// =====================================================

import Stok from '../models/stok.js';

// @desc    Get all Stok records
// @route   GET /api/stok
// @access  Private
export const getAllStok = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Stok.findAndCountAll({
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
      message: 'Error fetching Stok',
      error: error.message
    });
  }
};

// @desc    Get single Stok by ID
// @route   GET /api/stok/:id
// @access  Private
export const getStokById = async (req, res) => {
  try {
    const record = await Stok.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Stok not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Stok',
      error: error.message
    });
  }
};

// @desc    Create new Stok
// @route   POST /api/stok
// @access  Private
export const createStok = async (req, res) => {
  try {
    const record = await Stok.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Stok created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Stok',
      error: error.message
    });
  }
};

// @desc    Update Stok
// @route   PUT /api/stok/:id
// @access  Private
export const updateStok = async (req, res) => {
  try {
    const record = await Stok.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Stok not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Stok updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Stok',
      error: error.message
    });
  }
};

// @desc    Delete Stok
// @route   DELETE /api/stok/:id
// @access  Private
export const deleteStok = async (req, res) => {
  try {
    const record = await Stok.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Stok not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Stok deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Stok',
      error: error.message
    });
  }
};
