// backend/controllers/roleController.js
import Role from "../models/Role.js";

// GET /api/roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "code", "name", "description"],
    });
    res.json({ success: true, roles });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil data roles",
        error: err.message,
      });
  }
};
