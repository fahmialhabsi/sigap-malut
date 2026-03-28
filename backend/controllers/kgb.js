// =====================================================
// CONTROLLER: KgbController
// MODEL: Kgb
// Generated: 2026-03-19T23:39:27.524Z
// =====================================================

import Kgb from '../models/kgb.js';

// @desc    Get all Kgb records
// @route   GET /api/kgb
// @access  Private
export const getAllKgb = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Kgb.findAndCountAll({
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
      message: 'Error fetching Kgb',
      error: error.message
    });
  }
};

// @desc    Get single Kgb by ID
// @route   GET /api/kgb/:id
// @access  Private
export const getKgbById = async (req, res) => {
  try {
    const record = await Kgb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kgb not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Kgb',
      error: error.message
    });
  }
};

// @desc    Create new Kgb
// @route   POST /api/kgb
// @access  Private
export const createKgb = async (req, res) => {
  try {
    const record = await Kgb.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Kgb created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Kgb',
      error: error.message
    });
  }
};

// @desc    Update Kgb
// @route   PUT /api/kgb/:id
// @access  Private
export const updateKgb = async (req, res) => {
  try {
    const record = await Kgb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kgb not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Kgb updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Kgb',
      error: error.message
    });
  }
};

// @desc    Delete Kgb
// @route   DELETE /api/kgb/:id
// @access  Private
export const deleteKgb = async (req, res) => {
  try {
    const record = await Kgb.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kgb not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Kgb deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Kgb',
      error: error.message
    });
  }
};
