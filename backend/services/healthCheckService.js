/**
 * Health check untuk load balancer (ringan) dan diagnostik operasional (dalam).
 * Tahap 2 — operasional & kontinuitas.
 */
import sequelize from "../config/database.js";
import { getCacheStats, getCacheHealth } from "./cacheService.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

let _cachedVersion = null;
function readPackageVersion() {
  if (_cachedVersion) return _cachedVersion;
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    _cachedVersion = pkg.version || "unknown";
  } catch {
    _cachedVersion = "unknown";
  }
  return _cachedVersion;
}

export async function checkDatabase() {
  try {
    await sequelize.authenticate();
    const dialect = sequelize.getDialect();
    let approxTableCount = null;
    if (dialect === "postgres") {
      const [rows] = await sequelize.query(
        `SELECT COUNT(*)::int AS n FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
      );
      approxTableCount = rows?.[0]?.n ?? null;
    } else {
      const [tables] = await sequelize.query(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
      );
      approxTableCount = tables?.[0]?.count ?? null;
    }
    return {
      ok: true,
      dialect,
      approxTableCount,
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * @param {boolean} deep - jika true, uji DB + cache Redis; jika false, hanya status proses.
 */
export async function buildHealthPayload(deep) {
  const timestamp = new Date().toISOString();
  const version = readPackageVersion();

  if (!deep) {
    return {
      success: true,
      status: "ok",
      service: "sigap-malut-api",
      version,
      message: "SIGAP Malut API is running",
      timestamp,
      environment: process.env.NODE_ENV || "development",
      cache: getCacheStats(),
    };
  }

  const [database, cache] = await Promise.all([
    checkDatabase(),
    getCacheHealth(),
  ]);

  const healthy = database.ok === true;
  return {
    success: healthy,
    status: healthy ? "healthy" : "unhealthy",
    service: "sigap-malut-api",
    version,
    message: healthy
      ? "Deep health check passed"
      : "Deep health check failed (see checks.database)",
    timestamp,
    environment: process.env.NODE_ENV || "development",
    checks: {
      database,
      cache,
    },
  };
}
