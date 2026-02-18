// =====================================================
// CONTROLLER: BdsHrgController
// MODEL: BdsHrg
// Generated: 2026-02-17T19:24:48.388Z
// =====================================================

import BdsHrg from '../models/BDS-HRG.js';

// @desc    Get all BdsHrg records
// @route   GET /api/bds-hrg
// @access  Private
export const getAllBdsHrg = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsHrg.findAndCountAll({
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
      message: 'Error fetching BdsHrg',
      error: error.message
    });
  }
};

// @desc    Get single BdsHrg by ID
// @route   GET /api/bds-hrg/:id
// @access  Private
export const getBdsHrgById = async (req, res) => {
  try {
    const record = await BdsHrg.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsHrg not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsHrg',
      error: error.message
    });
  }
};

// @desc    Create new BdsHrg
// @route   POST /api/bds-hrg
// @access  Private
export const createBdsHrg = async (req, res) => {
  try {
    const record = await BdsHrg.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsHrg created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsHrg',
      error: error.message
    });
  }
};

// @desc    Update BdsHrg
// @route   PUT /api/bds-hrg/:id
// @access  Private
export const updateBdsHrg = async (req, res) => {
  try {
    const record = await BdsHrg.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsHrg not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsHrg updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsHrg',
      error: error.message
    });
  }
};

// @desc    Delete BdsHrg
// @route   DELETE /api/bds-hrg/:id
// @access  Private
export const deleteBdsHrg = async (req, res) => {
  try {
    const record = await BdsHrg.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsHrg not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsHrg deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsHrg',
      error: error.message
    });
  }
};
