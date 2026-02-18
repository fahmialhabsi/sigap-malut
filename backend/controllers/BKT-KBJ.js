// =====================================================
// CONTROLLER: BktKbjController
// MODEL: BktKbj
// Generated: 2026-02-17T19:24:48.401Z
// =====================================================

import BktKbj from '../models/BKT-KBJ.js';

// @desc    Get all BktKbj records
// @route   GET /api/bkt-kbj
// @access  Private
export const getAllBktKbj = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BktKbj.findAndCountAll({
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
      message: 'Error fetching BktKbj',
      error: error.message
    });
  }
};

// @desc    Get single BktKbj by ID
// @route   GET /api/bkt-kbj/:id
// @access  Private
export const getBktKbjById = async (req, res) => {
  try {
    const record = await BktKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktKbj not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BktKbj',
      error: error.message
    });
  }
};

// @desc    Create new BktKbj
// @route   POST /api/bkt-kbj
// @access  Private
export const createBktKbj = async (req, res) => {
  try {
    const record = await BktKbj.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BktKbj created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BktKbj',
      error: error.message
    });
  }
};

// @desc    Update BktKbj
// @route   PUT /api/bkt-kbj/:id
// @access  Private
export const updateBktKbj = async (req, res) => {
  try {
    const record = await BktKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktKbj not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BktKbj updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BktKbj',
      error: error.message
    });
  }
};

// @desc    Delete BktKbj
// @route   DELETE /api/bkt-kbj/:id
// @access  Private
export const deleteBktKbj = async (req, res) => {
  try {
    const record = await BktKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktKbj not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BktKbj deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BktKbj',
      error: error.message
    });
  }
};
