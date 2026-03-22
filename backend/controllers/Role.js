// =====================================================
// CONTROLLER: RoleController
// MODEL: Role
// Generated: 2026-03-19T23:39:27.526Z
// =====================================================

import Role from '../models/Role.js';

// @desc    Get all Role records
// @route   GET /api/role
// @access  Private
export const getAllRole = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Role.findAndCountAll({
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
      message: 'Error fetching Role',
      error: error.message
    });
  }
};

// @desc    Get single Role by ID
// @route   GET /api/role/:id
// @access  Private
export const getRoleById = async (req, res) => {
  try {
    const record = await Role.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Role',
      error: error.message
    });
  }
};

// @desc    Create new Role
// @route   POST /api/role
// @access  Private
export const createRole = async (req, res) => {
  try {
    const record = await Role.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Role',
      error: error.message
    });
  }
};

// @desc    Update Role
// @route   PUT /api/role/:id
// @access  Private
export const updateRole = async (req, res) => {
  try {
    const record = await Role.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Role updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Role',
      error: error.message
    });
  }
};

// @desc    Delete Role
// @route   DELETE /api/role/:id
// @access  Private
export const deleteRole = async (req, res) => {
  try {
    const record = await Role.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Role',
      error: error.message
    });
  }
};
