// =====================================================
// CONTROLLER: BdsBmbController
// MODEL: BdsBmb
// Generated: 2026-02-17T19:24:48.384Z
// =====================================================

import BdsBmb from '../models/BDS-BMB.js';

// @desc    Get all BdsBmb records
// @route   GET /api/bds-bmb
// @access  Private
export const getAllBdsBmb = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsBmb.findAndCountAll({
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
      message: 'Error fetching BdsBmb',
      error: error.message
    });
  }
};

// @desc    Get single BdsBmb by ID
// @route   GET /api/bds-bmb/:id
// @access  Private
export const getBdsBmbById = async (req, res) => {
  try {
    const record = await BdsBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsBmb not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsBmb',
      error: error.message
    });
  }
};

// @desc    Create new BdsBmb
// @route   POST /api/bds-bmb
// @access  Private
export const createBdsBmb = async (req, res) => {
  try {
    const record = await BdsBmb.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsBmb created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsBmb',
      error: error.message
    });
  }
};

// @desc    Update BdsBmb
// @route   PUT /api/bds-bmb/:id
// @access  Private
export const updateBdsBmb = async (req, res) => {
  try {
    const record = await BdsBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsBmb not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsBmb updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsBmb',
      error: error.message
    });
  }
};

// @desc    Delete BdsBmb
// @route   DELETE /api/bds-bmb/:id
// @access  Private
export const deleteBdsBmb = async (req, res) => {
  try {
    const record = await BdsBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsBmb not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsBmb deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsBmb',
      error: error.message
    });
  }
};
