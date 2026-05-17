/**
 * Envelope standar untuk /api/migration/*
 * Sukses: { success, code, message, field, details, data }
 * Gagal:  { code, message, field, details } (tanpa success — konsisten UAT)
 */

export class HttpMigrationError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} code
   * @param {string} message
   * @param {{ field?: string|null, details?: unknown[] }} [opts]
   */
  constructor(statusCode, code, message, { field = null, details = [] } = {}) {
    super(message);
    this.name = "HttpMigrationError";
    this.statusCode = statusCode;
    this.code = code;
    this.field = field ?? null;
    this.details = Array.isArray(details) ? details : [];
  }
}

export function migrationSuccess(res, data, message = "OK") {
  return res.json({
    success: true,
    code: "OK",
    message,
    field: null,
    details: [],
    data,
  });
}

/** Respons error JSON (boleh dipakai dari catch manual) */
export function migrationErrorJson(err) {
  const status = err?.statusCode ?? 500;
  const code =
    err?.code ||
    (status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
  const message = err?.message || "Terjadi kesalahan";
  const field = err?.field ?? null;
  let details = [];
  if (Array.isArray(err?.details) && err.details.length) {
    details = err.details;
  } else if (Array.isArray(err?.duplicates) && err.duplicates.length) {
    details = [{ issue: "DUPLICATE_APPROVED_MAPPING", mappings: err.duplicates }];
  } else if (err?.preview_summary) {
    details = [{ issue: "PREVIEW_SUMMARY", summary: err.preview_summary }];
  }
  return { status, body: { code, message, field, details } };
}

export function migrationFail(res, err) {
  const { status, body } = migrationErrorJson(err);
  if (status >= 500) {
    console.error("[migration]", err);
  }
  return res.status(status).json(body);
}

/**
 * Wrapper handler async — tangkap HttpMigrationError & Error biasa.
 */
export function migrationAsync(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      if (res.headersSent) return next(err);
      return migrationFail(res, err);
    }
  };
}
