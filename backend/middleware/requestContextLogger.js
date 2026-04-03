/**
 * Request ID + log terstruktur (Winston) untuk audit operasional / insiden.
 * Tahap 2 — logging terstruktur.
 */
import { randomUUID } from "crypto";

export function createRequestContextLogger(logger) {
  return function requestContextLogger(req, res, next) {
    const requestId =
      (typeof req.headers["x-request-id"] === "string" &&
        req.headers["x-request-id"].trim()) ||
      randomUUID();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    const start = Date.now();
    const skipStructuredLog = req.path === "/health" || req.path === "/metrics";

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      if (skipStructuredLog) return;
      const payload = {
        requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs,
        userId: req.user?.id ?? null,
        role: req.user?.role ?? null,
      };
      if (res.statusCode >= 500) {
        logger.error("http_request", payload);
      } else if (res.statusCode >= 400) {
        logger.warn("http_request", payload);
      } else {
        logger.info("http_request", payload);
      }
    });

    next();
  };
}
