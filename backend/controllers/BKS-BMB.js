// =====================================================
// CONTROLLER: BksBmbController
// MODEL: BksBmb
// Generated: 2026-02-17T19:24:48.391Z
// =====================================================

import BksBmb from '../models/BKS-BMB.js';

// @desc    Get all BksBmb records
// @route   GET /api/bks-bmb
// @access  Private
export const getAllBksBmb = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BksBmb.findAndCountAll({
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
      message: 'Error fetching BksBmb',
      error: error.message
    });
  }
};

// @desc    Get single BksBmb by ID
// @route   GET /api/bks-bmb/:id
// @access  Private
export const getBksBmbById = async (req, res) => {
  try {
    const record = await BksBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksBmb not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BksBmb',
      error: error.message
    });
  }
};

// @desc    Create new BksBmb
// @route   POST /api/bks-bmb
// @access  Private
export const createBksBmb = async (req, res) => {
  try {
    const record = await BksBmb.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BksBmb created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BksBmb',
      error: error.message
    });
  }
};

// @desc    Update BksBmb
// @route   PUT /api/bks-bmb/:id
// @access  Private
export const updateBksBmb = async (req, res) => {
  try {
    const record = await BksBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksBmb not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BksBmb updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BksBmb',
      error: error.message
    });
  }
};

// @desc    Delete BksBmb
// @route   DELETE /api/bks-bmb/:id
// @access  Private
export const deleteBksBmb = async (req, res) => {
  try {
    const record = await BksBmb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksBmb not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BksBmb deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BksBmb',
      error: error.message
    });
  }
};
