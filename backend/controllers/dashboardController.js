import { getDashboardSummary } from "../services/dashboardService.js";

export async function getSummary(_req, res) {
  try {
    const summary = await getDashboardSummary();

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard",
      error: error.message,
    });
  }
}

export default { getSummary };
