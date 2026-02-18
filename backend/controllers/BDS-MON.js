// =====================================================
// CONTROLLER: BdsMonController
// MODEL: BdsMon
// Generated: 2026-02-17T19:24:48.391Z
// =====================================================

import BdsMon from '../models/BDS-MON.js';

// @desc    Get all BdsMon records
// @route   GET /api/bds-mon
// @access  Private
export const getAllBdsMon = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsMon.findAndCountAll({
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
      message: 'Error fetching BdsMon',
      error: error.message
    });
  }
};

// @desc    Get single BdsMon by ID
// @route   GET /api/bds-mon/:id
// @access  Private
export const getBdsMonById = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsMon not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsMon',
      error: error.message
    });
  }
};

// @desc    Create new BdsMon
// @route   POST /api/bds-mon
// @access  Private
export const createBdsMon = async (req, res) => {
  try {
    const record = await BdsMon.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsMon created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsMon',
      error: error.message
    });
  }
};

// @desc    Update BdsMon
// @route   PUT /api/bds-mon/:id
// @access  Private
export const updateBdsMon = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsMon not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsMon updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsMon',
      error: error.message
    });
  }
};

// @desc    Delete BdsMon
// @route   DELETE /api/bds-mon/:id
// @access  Private
export const deleteBdsMon = async (req, res) => {
  try {
    const record = await BdsMon.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsMon not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsMon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsMon',
      error: error.message
    });
  }
};
