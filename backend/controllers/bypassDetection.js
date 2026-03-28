// =====================================================
// CONTROLLER: BypassdetectionController
// MODEL: Bypassdetection
// Generated: 2026-03-19T23:39:27.518Z
// =====================================================

import Bypassdetection from '../models/bypassDetection.js';

// @desc    Get all Bypassdetection records
// @route   GET /api/bypassdetection
// @access  Private
export const getAllBypassdetection = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Bypassdetection.findAndCountAll({
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
      message: 'Error fetching Bypassdetection',
      error: error.message
    });
  }
};

// @desc    Get single Bypassdetection by ID
// @route   GET /api/bypassdetection/:id
// @access  Private
export const getBypassdetectionById = async (req, res) => {
  try {
    const record = await Bypassdetection.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bypassdetection not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Bypassdetection',
      error: error.message
    });
  }
};

// @desc    Create new Bypassdetection
// @route   POST /api/bypassdetection
// @access  Private
export const createBypassdetection = async (req, res) => {
  try {
    const record = await Bypassdetection.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Bypassdetection created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Bypassdetection',
      error: error.message
    });
  }
};

// @desc    Update Bypassdetection
// @route   PUT /api/bypassdetection/:id
// @access  Private
export const updateBypassdetection = async (req, res) => {
  try {
    const record = await Bypassdetection.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bypassdetection not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Bypassdetection updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Bypassdetection',
      error: error.message
    });
  }
};

// @desc    Delete Bypassdetection
// @route   DELETE /api/bypassdetection/:id
// @access  Private
export const deleteBypassdetection = async (req, res) => {
  try {
    const record = await Bypassdetection.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Bypassdetection not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Bypassdetection deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Bypassdetection',
      error: error.message
    });
  }
};
