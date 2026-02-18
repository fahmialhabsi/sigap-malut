// =====================================================
// CONTROLLER: BdsKbjController
// MODEL: BdsKbj
// Generated: 2026-02-17T19:24:48.389Z
// =====================================================

import BdsKbj from '../models/BDS-KBJ.js';

// @desc    Get all BdsKbj records
// @route   GET /api/bds-kbj
// @access  Private
export const getAllBdsKbj = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsKbj.findAndCountAll({
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
      message: 'Error fetching BdsKbj',
      error: error.message
    });
  }
};

// @desc    Get single BdsKbj by ID
// @route   GET /api/bds-kbj/:id
// @access  Private
export const getBdsKbjById = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsKbj not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsKbj',
      error: error.message
    });
  }
};

// @desc    Create new BdsKbj
// @route   POST /api/bds-kbj
// @access  Private
export const createBdsKbj = async (req, res) => {
  try {
    const record = await BdsKbj.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsKbj created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsKbj',
      error: error.message
    });
  }
};

// @desc    Update BdsKbj
// @route   PUT /api/bds-kbj/:id
// @access  Private
export const updateBdsKbj = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsKbj not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsKbj updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsKbj',
      error: error.message
    });
  }
};

// @desc    Delete BdsKbj
// @route   DELETE /api/bds-kbj/:id
// @access  Private
export const deleteBdsKbj = async (req, res) => {
  try {
    const record = await BdsKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsKbj not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsKbj deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsKbj',
      error: error.message
    });
  }
};
