// =====================================================
// CONTROLLER: BktMevController
// MODEL: BktMev
// Generated: 2026-02-17T19:24:48.402Z
// =====================================================

import BktMev from '../models/BKT-MEV.js';

// @desc    Get all BktMev records
// @route   GET /api/bkt-mev
// @access  Private
export const getAllBktMev = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BktMev.findAndCountAll({
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
      message: 'Error fetching BktMev',
      error: error.message
    });
  }
};

// @desc    Get single BktMev by ID
// @route   GET /api/bkt-mev/:id
// @access  Private
export const getBktMevById = async (req, res) => {
  try {
    const record = await BktMev.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktMev not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BktMev',
      error: error.message
    });
  }
};

// @desc    Create new BktMev
// @route   POST /api/bkt-mev
// @access  Private
export const createBktMev = async (req, res) => {
  try {
    const record = await BktMev.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BktMev created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BktMev',
      error: error.message
    });
  }
};

// @desc    Update BktMev
// @route   PUT /api/bkt-mev/:id
// @access  Private
export const updateBktMev = async (req, res) => {
  try {
    const record = await BktMev.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktMev not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BktMev updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BktMev',
      error: error.message
    });
  }
};

// @desc    Delete BktMev
// @route   DELETE /api/bkt-mev/:id
// @access  Private
export const deleteBktMev = async (req, res) => {
  try {
    const record = await BktMev.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktMev not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BktMev deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BktMev',
      error: error.message
    });
  }
};
