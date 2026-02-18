// =====================================================
// CONTROLLER: BktPgdController
// MODEL: BktPgd
// Generated: 2026-02-17T19:24:48.403Z
// =====================================================

import BktPgd from '../models/BKT-PGD.js';

// @desc    Get all BktPgd records
// @route   GET /api/bkt-pgd
// @access  Private
export const getAllBktPgd = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BktPgd.findAndCountAll({
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
      message: 'Error fetching BktPgd',
      error: error.message
    });
  }
};

// @desc    Get single BktPgd by ID
// @route   GET /api/bkt-pgd/:id
// @access  Private
export const getBktPgdById = async (req, res) => {
  try {
    const record = await BktPgd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktPgd not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BktPgd',
      error: error.message
    });
  }
};

// @desc    Create new BktPgd
// @route   POST /api/bkt-pgd
// @access  Private
export const createBktPgd = async (req, res) => {
  try {
    const record = await BktPgd.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BktPgd created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BktPgd',
      error: error.message
    });
  }
};

// @desc    Update BktPgd
// @route   PUT /api/bkt-pgd/:id
// @access  Private
export const updateBktPgd = async (req, res) => {
  try {
    const record = await BktPgd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktPgd not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BktPgd updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BktPgd',
      error: error.message
    });
  }
};

// @desc    Delete BktPgd
// @route   DELETE /api/bkt-pgd/:id
// @access  Private
export const deleteBktPgd = async (req, res) => {
  try {
    const record = await BktPgd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BktPgd not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BktPgd deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BktPgd',
      error: error.message
    });
  }
};
