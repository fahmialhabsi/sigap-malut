import {
  buildExecutiveHorizontalRollup,
  buildKabidHorizontalDashboard,
  buildSekretarisHorizontalDashboard,
  buildUptdHorizontalDashboard,
} from "../services/horizontalCoordinationDashboardService.js";

function normRole(user) {
  return String(user?.role || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function allowSekretaris(user) {
  const r = normRole(user);
  return r === "super_admin" || r.includes("sekretaris");
}

function allowKabid(user) {
  const r = normRole(user);
  if (r === "super_admin") return true;
  return (
    r.includes("kepala_bidang") ||
    r.includes("kabid") ||
    (r === "kepala_bidang" && String(user?.unit_kerja || "").length > 0)
  );
}

function allowUptd(user) {
  const r = normRole(user);
  return r === "super_admin" || r.includes("kepala_uptd") || r === "kepala_uptd";
}

function allowExecutive(user) {
  const r = normRole(user);
  return r === "super_admin" || r.includes("gubernur") || r === "kepala_dinas";
}

function parseQuery(req) {
  return {
    status: req.query.status,
    level: req.query.level,
    unit: req.query.unit,
    sla: req.query.sla,
  };
}

export async function getHorizontalDashboardSekretaris(req, res) {
  try {
    if (!allowSekretaris(req.user)) {
      return res.status(403).json({ success: false, message: "Akses khusus Sekretaris / Super Admin." });
    }
    const data = await buildSekretarisHorizontalDashboard(req.user, parseQuery(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat dashboard koordinasi Sekretaris",
      error: err.message,
    });
  }
}

export async function getHorizontalDashboardKabid(req, res) {
  try {
    if (!allowKabid(req.user)) {
      return res.status(403).json({ success: false, message: "Akses khusus Kepala Bidang / Super Admin." });
    }
    const data = await buildKabidHorizontalDashboard(req.user, parseQuery(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat dashboard koordinasi Kabid",
      error: err.message,
    });
  }
}

export async function getHorizontalDashboardUptd(req, res) {
  try {
    if (!allowUptd(req.user)) {
      return res.status(403).json({ success: false, message: "Akses khusus Kepala UPTD / Super Admin." });
    }
    const data = await buildUptdHorizontalDashboard(req.user, parseQuery(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat dashboard koordinasi UPTD",
      error: err.message,
    });
  }
}

export async function getHorizontalDashboardExecutive(req, res) {
  try {
    if (!allowExecutive(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Akses khusus Gubernur / Kepala Dinas / Super Admin.",
      });
    }
    const data = await buildExecutiveHorizontalRollup(req.user, parseQuery(req));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat ringkasan koordinasi eksekutif",
      error: err.message,
    });
  }
}
