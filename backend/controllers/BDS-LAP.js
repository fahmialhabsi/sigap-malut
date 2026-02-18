// =====================================================
// CONTROLLER: BdsLapController
// MODEL: BdsLap
// Generated: 2026-02-17T19:24:48.390Z
// =====================================================

import BdsLap from '../models/BDS-LAP.js';

// @desc    Get all BdsLap records
// @route   GET /api/bds-lap
// @access  Private
export const getAllBdsLap = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsLap.findAndCountAll({
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
      message: 'Error fetching BdsLap',
      error: error.message
    });
  }
};

// @desc    Get single BdsLap by ID
// @route   GET /api/bds-lap/:id
// @access  Private
export const getBdsLapById = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsLap not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsLap',
      error: error.message
    });
  }
};

// @desc    Create new BdsLap
// @route   POST /api/bds-lap
// @access  Private
export const createBdsLap = async (req, res) => {
  try {
    const record = await BdsLap.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsLap created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsLap',
      error: error.message
    });
  }
};

// @desc    Update BdsLap
// @route   PUT /api/bds-lap/:id
// @access  Private
export const updateBdsLap = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsLap not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsLap updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsLap',
      error: error.message
    });
  }
};

// @desc    Delete BdsLap
// @route   DELETE /api/bds-lap/:id
// @access  Private
export const deleteBdsLap = async (req, res) => {
  try {
    const record = await BdsLap.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsLap not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsLap deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsLap',
      error: error.message
    });
  }
};
