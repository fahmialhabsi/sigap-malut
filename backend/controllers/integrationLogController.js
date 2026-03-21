import DataIntegrationLog from "../models/dataIntegrationLog.js";

export const getIntegrationLogs = async (req, res) => {
  try {
    const { unit, status, limit = 100, page = 1 } = req.query;
    const where = {};
    if (unit) where.source_unit = unit;
    if (status) where.status = status;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await DataIntegrationLog.findAndCountAll({
      where,
      order: [["integrated_at", "DESC"]],
      limit: parseInt(limit),
      offset,
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
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil log integrasi",
        error: err.message,
      });
  }
};
