// =====================================================
// CONTROLLER: UptKeuController
// MODEL: UptKeu
// Generated: 2026-02-17T19:24:48.417Z
// =====================================================

import UptKeu from '../models/UPT-KEU.js';

// @desc    Get all UptKeu records
// @route   GET /api/upt-keu
// @access  Private
export const getAllUptKeu = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await UptKeu.findAndCountAll({
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
      message: 'Error fetching UptKeu',
      error: error.message
    });
  }
};

// @desc    Get single UptKeu by ID
// @route   GET /api/upt-keu/:id
// @access  Private
export const getUptKeuById = async (req, res) => {
  try {
    const record = await UptKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKeu not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching UptKeu',
      error: error.message
    });
  }
};

// @desc    Create new UptKeu
// @route   POST /api/upt-keu
// @access  Private
export const createUptKeu = async (req, res) => {
  try {
    const record = await UptKeu.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'UptKeu created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating UptKeu',
      error: error.message
    });
  }
};

// @desc    Update UptKeu
// @route   PUT /api/upt-keu/:id
// @access  Private
export const updateUptKeu = async (req, res) => {
  try {
    const record = await UptKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKeu not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'UptKeu updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating UptKeu',
      error: error.message
    });
  }
};

// @desc    Delete UptKeu
// @route   DELETE /api/upt-keu/:id
// @access  Private
export const deleteUptKeu = async (req, res) => {
  try {
    const record = await UptKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKeu not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'UptKeu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting UptKeu',
      error: error.message
    });
  }
};
