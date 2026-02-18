// =====================================================
// CONTROLLER: BdsCpdController
// MODEL: BdsCpd
// Generated: 2026-02-17T19:24:48.387Z
// =====================================================

import BdsCpd from '../models/BDS-CPD.js';

// @desc    Get all BdsCpd records
// @route   GET /api/bds-cpd
// @access  Private
export const getAllBdsCpd = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await BdsCpd.findAndCountAll({
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
      message: 'Error fetching BdsCpd',
      error: error.message
    });
  }
};

// @desc    Get single BdsCpd by ID
// @route   GET /api/bds-cpd/:id
// @access  Private
export const getBdsCpdById = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsCpd not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching BdsCpd',
      error: error.message
    });
  }
};

// @desc    Create new BdsCpd
// @route   POST /api/bds-cpd
// @access  Private
export const createBdsCpd = async (req, res) => {
  try {
    const record = await BdsCpd.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'BdsCpd created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating BdsCpd',
      error: error.message
    });
  }
};

// @desc    Update BdsCpd
// @route   PUT /api/bds-cpd/:id
// @access  Private
export const updateBdsCpd = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsCpd not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'BdsCpd updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating BdsCpd',
      error: error.message
    });
  }
};

// @desc    Delete BdsCpd
// @route   DELETE /api/bds-cpd/:id
// @access  Private
export const deleteBdsCpd = async (req, res) => {
  try {
    const record = await BdsCpd.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'BdsCpd not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'BdsCpd deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting BdsCpd',
      error: error.message
    });
  }
};
