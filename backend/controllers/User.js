// =====================================================
// CONTROLLER: UserController
// MODEL: User
// Generated: 2026-03-19T23:39:27.579Z
// =====================================================

import User from "../models/User.js";
import Role from "../models/Role.js";

// @desc    Get all User records
// @route   GET /api/user
// @access  Private
export const getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching User",
      error: error.message,
    });
  }
};

// @desc    Get single User by ID
// @route   GET /api/user/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching User",
      error: error.message,
    });
  }
};

// @desc    Create new User
// @route   POST /api/user
// @access  Private
export const createUser = async (req, res) => {
  try {
    // Otomatisasi: Pastikan role user sudah ada di tabel roles
    const { role, role_id } = req.body;
    if (role) {
      let roleRecord = null;
      // Helper untuk generate level unik jika perlu
      const getNextRoleLevel = async () => {
        const maxRole = await Role.findOne({ order: [["level", "DESC"]] });
        return maxRole && maxRole.level ? maxRole.level + 1 : 9999;
      };
      // Jika role_id diberikan, cek berdasarkan id
      if (role_id) {
        roleRecord = await Role.findOne({ where: { id: role_id } });
        if (!roleRecord) {
          // Jika role_id tidak ditemukan, insert role baru dengan id dan code sesuai input
          const level = await getNextRoleLevel();
          roleRecord = await Role.create({
            id: role_id,
            code: role,
            name: role,
            level,
            is_active: true,
          });
        }
      } else {
        // Jika role_id tidak diberikan, cek berdasarkan code
        roleRecord = await Role.findOne({ where: { code: role } });
        if (!roleRecord) {
          const { v4: uuidv4 } = await import("uuid");
          const newRoleId = uuidv4();
          const level = await getNextRoleLevel();
          roleRecord = await Role.create({
            id: newRoleId,
            code: role,
            name: role,
            level,
            is_active: true,
          });
          req.body.role_id = newRoleId;
        } else {
          req.body.role_id = roleRecord.id;
        }
      }
      // Selalu sync kolom `role` dengan code dari Role record agar tidak tertinggal di nilai default
      if (roleRecord?.code) req.body.role = roleRecord.code;
    } else if (role_id && !role) {
      // role_id diberikan tanpa role — resolve code dari DB dan sync kolom role
      const roleRecord = await Role.findOne({ where: { id: role_id } });
      if (roleRecord?.code) req.body.role = roleRecord.code;
    }

    const record = await User.create({
      ...req.body,
      created_by: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating User",
      error: error.message,
    });
  }
};

// @desc    Update User
// @route   PUT /api/user/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Jika role_id diperbarui, sync kolom role agar tidak tertinggal di nilai default
    if (req.body.role_id && !req.body.role) {
      try {
        const roleRecord = await Role.findOne({ where: { id: req.body.role_id } });
        if (roleRecord?.code) req.body.role = roleRecord.code;
      } catch (_) {}
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating User",
      error: error.message,
    });
  }
};

// @desc    Delete User
// @route   DELETE /api/user/:id
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await record.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: req.user?.id || null,
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting User",
      error: error.message,
    });
  }
};
