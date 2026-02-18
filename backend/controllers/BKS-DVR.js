// =====================================================
// CONTROLLER: BksDvrController
// MODEL: BksDvr
// Generated: 2026-02-17T19:24:48.392Z
// =====================================================

import BksDvr from '../models/BKS-DVR.js';

// @desc    Get all BksDvr records
// @route   GET /api/bks-dvr
// @access  Private
export const getAllBksDvr = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BksDvr.findAndCountAll({
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
      message: 'Error fetching BksDvr',
      error: error.message
    });
  }
};

// @desc    Get single BksDvr by ID
// @route   GET /api/bks-dvr/:id
// @access  Private
export const getBksDvrById = async (req, res) => {
  try {
    const record = await BksDvr.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksDvr not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BksDvr',
      error: error.message
    });
  }
};

// @desc    Create new BksDvr
// @route   POST /api/bks-dvr
// @access  Private
export const createBksDvr = async (req, res) => {
  try {
    const record = await BksDvr.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BksDvr created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BksDvr',
      error: error.message
    });
  }
};

// @desc    Update BksDvr
// @route   PUT /api/bks-dvr/:id
// @access  Private
export const updateBksDvr = async (req, res) => {
  try {
    const record = await BksDvr.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksDvr not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BksDvr updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BksDvr',
      error: error.message
    });
  }
};

// @desc    Delete BksDvr
// @route   DELETE /api/bks-dvr/:id
// @access  Private
export const deleteBksDvr = async (req, res) => {
  try {
    const record = await BksDvr.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BksDvr not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BksDvr deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BksDvr',
      error: error.message
    });
  }
};
