/**
 * cacheMiddleware.js
 *
 * Express middleware untuk response caching otomatis via cacheService.
 * Hanya cache GET requests dengan status 2xx.
 *
 * Penggunaan:
 *   import { withCache } from "../middleware/cacheMiddleware.js";
 *   router.get("/data", authenticate, withCache("prefix", 60), controller);
 */

import { cacheGet, cacheSet, TTL } from "../services/cacheService.js";

/**
 * Buat cache key dari request.
 * Mengikutsertakan userId agar data per-user tidak tercampur.
 */
function buildCacheKey(prefix, req) {
  const userId = req.user?.id ?? "anon";
  const query = new URLSearchParams(req.query).toString();
  return `${prefix}:${userId}:${req.path}${query ? "?" + query : ""}`;
}

/**
 * withCache(prefix, ttl?)
 *
 * @param {string} prefix  - Namespace cache key, misal "inflasi", "kpi"
 * @param {number} [ttl]   - TTL dalam detik (default: TTL.DASHBOARD = 60)
 */
export function withCache(prefix, ttl = TTL.DASHBOARD) {
  return async (req, res, next) => {
    // Hanya cache GET
    if (req.method !== "GET") return next();

    const key = buildCacheKey(prefix, req);

    try {
      const cached = await cacheGet(key);
      if (cached !== null) {
        return res.set("X-Cache", "HIT").set("X-Cache-TTL", ttl).json(cached);
      }
    } catch {
      // Cache error → lanjut ke controller
    }

    // Intercept res.json agar kita bisa store ke cache
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await cacheSet(key, body, ttl);
        } catch {
          // Jangan blokir response jika cache write gagal
        }
      }
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate semua cache dengan prefix tertentu.
 * Cocok dipanggil setelah data mutation (POST/PUT/DELETE).
 */
export function invalidateCache(prefix) {
  return async (req, res, next) => {
    next();
    // Invalidate setelah response (fire-and-forget)
    import("../services/cacheService.js").then(({ cacheFlushPattern }) => {
      cacheFlushPattern(`${prefix}:*`).catch(() => {});
    });
  };
}

export default { withCache, invalidateCache };
