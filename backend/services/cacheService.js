/**
 * cacheService.js
 *
 * Cache layer untuk SIGAP MALUT.
 * Menggunakan Redis (ioredis) sebagai primary cache.
 * Fallback otomatis ke in-memory Map jika Redis tidak tersedia.
 *
 * TTL defaults (sesuai dokumen):
 *  - KPI aggregate : 300 detik (5 menit)
 *  - Dashboard data: 60 detik
 *  - Master data   : 600 detik (10 menit)
 */

import { createRequire } from "module";

// ── TTL constants (detik) ─────────────────────────────────────────────────────
export const TTL = {
  KPI: 300, // 5 menit
  DASHBOARD: 60, // 1 menit
  MASTER: 600, // 10 menit
  SHORT: 30, // 30 detik
};

// ── In-Memory fallback ────────────────────────────────────────────────────────
const _memStore = new Map(); // key → { value, expiresAt }

function memSet(key, value, ttlSeconds) {
  _memStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function memGet(key) {
  const entry = _memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _memStore.delete(key);
    return null;
  }
  return entry.value;
}

function memDel(key) {
  _memStore.delete(key);
}

function memFlushPattern(pattern) {
  const regex = new RegExp(pattern.replace("*", ".*"));
  for (const key of _memStore.keys()) {
    if (regex.test(key)) _memStore.delete(key);
  }
}

// ── Redis client (lazy) ────────────────────────────────────────────────────────
let _redis = null;
let _useRedis = false;
let _initAttempted = false;

async function getRedis() {
  if (_initAttempted) return _redis;
  _initAttempted = true;

  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0"),
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    await client.connect();
    await client.ping();

    _redis = client;
    _useRedis = true;
    console.log("[Cache] Redis connected ✓");

    client.on("error", (err) => {
      if (_useRedis) {
        console.warn(
          "[Cache] Redis error, falling back to in-memory:",
          err.message,
        );
        _useRedis = false;
      }
    });

    client.on("reconnecting", () => {
      console.log("[Cache] Redis reconnecting...");
    });

    client.on("connect", () => {
      _useRedis = true;
      console.log("[Cache] Redis reconnected ✓");
    });
  } catch (err) {
    console.log(
      `[Cache] Redis unavailable (${err.message}), using in-memory cache`,
    );
    _redis = null;
    _useRedis = false;
  }

  return _redis;
}

// Initialize on import (non-blocking)
getRedis().catch(() => {});

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Set cache value dengan TTL.
 * @param {string} key
 * @param {any}    value
 * @param {number} [ttl=TTL.DASHBOARD] - detik
 */
export async function cacheSet(key, value, ttl = TTL.DASHBOARD) {
  const serialized = JSON.stringify(value);
  if (_useRedis && _redis) {
    try {
      await _redis.setex(key, ttl, serialized);
      return;
    } catch {
      _useRedis = false;
    }
  }
  memSet(key, serialized, ttl);
}

/**
 * Get cache value. Returns null jika tidak ada / expired.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  if (_useRedis && _redis) {
    try {
      const val = await _redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      _useRedis = false;
    }
  }
  const val = memGet(key);
  return val ? JSON.parse(val) : null;
}

/**
 * Delete cache key.
 */
export async function cacheDel(key) {
  if (_useRedis && _redis) {
    try {
      await _redis.del(key);
      return;
    } catch {
      _useRedis = false;
    }
  }
  memDel(key);
}

/**
 * Flush semua key yang cocok dengan pattern (glob, misal "kpi:*").
 */
export async function cacheFlushPattern(pattern) {
  if (_useRedis && _redis) {
    try {
      const keys = await _redis.keys(pattern);
      if (keys.length > 0) await _redis.del(keys);
      return;
    } catch {
      _useRedis = false;
    }
  }
  memFlushPattern(pattern);
}

/**
 * Apakah Redis aktif saat ini?
 */
export function isRedisActive() {
  return _useRedis;
}

/**
 * Statistik cache (untuk diagnostik).
 */
export function getCacheStats() {
  return {
    backend: _useRedis ? "redis" : "memory",
    memoryKeys: _memStore.size,
  };
}

export default {
  cacheSet,
  cacheGet,
  cacheDel,
  cacheFlushPattern,
  isRedisActive,
  getCacheStats,
  TTL,
};
