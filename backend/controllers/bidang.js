// =====================================================
// CONTROLLER: BidangController
// MODEL: Bidang
// Generated: 2026-03-19T23:39:27.504Z
// =====================================================

import Bidang from '../models/bidang.js';

// @desc    Get all Bidang records
// @route   GET /api/bidang
// @access  Private
export const getAllBidang = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Bidang.findAndCountAll({
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
      message: 'Error fetching Bidang',
      error: error.message
    });
  }
};

// @desc    Get single Bidang by ID
// @route   GET /api/bidang/:id
// @access  Private
export const getBidangById = async (req, res) => {
  try {
    const record = await Bidang.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bidang not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Bidang',
      error: error.message
    });
  }
};

// @desc    Create new Bidang
// @route   POST /api/bidang
// @access  Private
export const createBidang = async (req, res) => {
  try {
    const record = await Bidang.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Bidang created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Bidang',
      error: error.message
    });
  }
};

// @desc    Update Bidang
// @route   PUT /api/bidang/:id
// @access  Private
export const updateBidang = async (req, res) => {
  try {
    const record = await Bidang.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bidang not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Bidang updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Bidang',
      error: error.message
    });
  }
};

// @desc    Delete Bidang
// @route   DELETE /api/bidang/:id
// @access  Private
export const deleteBidang = async (req, res) => {
  try {
    const record = await Bidang.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bidang not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Bidang deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Bidang',
      error: error.message
    });
  }
};
