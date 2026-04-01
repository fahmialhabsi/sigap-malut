import { Op } from "sequelize";
import BypassDetection from "../../models/BypassDetection.js";

export const listBypassSekretaris = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // default: last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { count, rows } = await BypassDetection.findAndCountAll({
      where: {
        detected_at: { [Op.gte]: since },
      },
      order: [["detected_at", "DESC"]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data bypass",
      error: error.message,
    });
  }
};

