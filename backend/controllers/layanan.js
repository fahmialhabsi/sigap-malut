// =====================================================
// CONTROLLER: LayananController
// MODEL: Layanan
// Generated: 2026-03-19T23:39:27.525Z
// =====================================================

import Layanan from '../models/layanan.js';

// @desc    Get all Layanan records
// @route   GET /api/layanan
// @access  Private
export const getAllLayanan = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Layanan.findAndCountAll({
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
      message: 'Error fetching Layanan',
      error: error.message
    });
  }
};

// @desc    Get single Layanan by ID
// @route   GET /api/layanan/:id
// @access  Private
export const getLayananById = async (req, res) => {
  try {
    const record = await Layanan.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Layanan',
      error: error.message
    });
  }
};

// @desc    Create new Layanan
// @route   POST /api/layanan
// @access  Private
export const createLayanan = async (req, res) => {
  try {
    const record = await Layanan.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Layanan created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Layanan',
      error: error.message
    });
  }
};

// @desc    Update Layanan
// @route   PUT /api/layanan/:id
// @access  Private
export const updateLayanan = async (req, res) => {
  try {
    const record = await Layanan.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Layanan updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Layanan',
      error: error.message
    });
  }
};

// @desc    Delete Layanan
// @route   DELETE /api/layanan/:id
// @access  Private
export const deleteLayanan = async (req, res) => {
  try {
    const record = await Layanan.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Layanan not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Layanan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Layanan',
      error: error.message
    });
  }
};
