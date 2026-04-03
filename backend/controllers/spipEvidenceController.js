import { computeRangeFromPeriod, getEvidenceSummary } from "../services/spipEvidenceSummaryService.js";

export async function getSpipEvidenceSummary(req, res) {
  try {
    const range = computeRangeFromPeriod({
      granularity: req.query.granularity,
      date: req.query.date,
      year: req.query.year,
      month: req.query.month,
    });
    if (!range.start || !range.end) {
      return res.status(400).json({
        success: false,
        message: "Periode tidak valid. Gunakan: granularity=day|month|year dan date/year/month yang sesuai.",
      });
    }

    const limit = req.query.limit ? Math.max(1, Math.min(500, parseInt(String(req.query.limit), 10))) : 100;
    const data = await getEvidenceSummary({ start: range.start, end: range.end, limit });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan bukti",
      error: error.message,
    });
  }
}

