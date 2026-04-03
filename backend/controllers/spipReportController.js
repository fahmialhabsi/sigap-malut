import { buildSpipWorkbook } from "../services/spipReportService.js";
import { buildSpipWorkbookFromDb } from "../services/spipDbReportService.js";

function safeDateForName(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function exportSpipReport(req, res) {
  try {
    const format = String(req.query.format || "xlsx").toLowerCase();
    if (format !== "xlsx") {
      return res.status(400).json({
        success: false,
        message: "format tidak didukung (gunakan: xlsx)",
      });
    }

    const source = String(req.query.source || "master").toLowerCase(); // master|db
    const isDb = source === "db";
    const buildParams = {
      granularity: req.query.granularity,
      date: req.query.date,
      year: req.query.year,
      month: req.query.month,
    };

    const built = isDb
      ? await buildSpipWorkbookFromDb(buildParams)
      : await buildSpipWorkbook(buildParams);

    const workbook = built.workbook;
    const period = built.period || built.range || null;

    const stamp = safeDateForName();
    const qYear = req.query.year ? parseInt(String(req.query.year), 10) : null;
    const qMonth = req.query.month ? parseInt(String(req.query.month), 10) : null;
    const qDate = req.query.date ? String(req.query.date) : null;
    const g = String(req.query.granularity || period?.granularity || "year").toLowerCase();
    const periodPart =
      g === "year" && qYear
        ? `y${qYear}`
        : g === "month" && qYear && qMonth
          ? `m${qYear}${String(qMonth).padStart(2, "0")}`
          : g === "day" && qDate
            ? `d${String(qDate).replaceAll("-", "")}`
            : "all";

    const filename = `laporan-spip-${String(req.query.source || "master").toLowerCase()}-${periodPart}-${stamp}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengekspor laporan SPIP",
      error: error.message,
    });
  }
}

