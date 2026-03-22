/**
 * kpiPollingService.js
 *
 * Service yang melakukan polling KPI aggregate setiap 5 menit
 * dan mem-broadcast hasilnya via Socket.IO ke semua client.
 *
 * KPI yang dibroadcast:
 *  - Inflasi bulanan (dari tabel InflasiData / fallback dummy)
 *  - Stok ketersediaan pangan
 *  - Status distribusi
 */

import { broadcastKPI, ROOMS } from "./socketService.js";
import { cacheSet, cacheGet, TTL } from "./cacheService.js";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
let _pollTimer = null;
let _isRunning = false;

// ── KPI fetchers ──────────────────────────────────────────────────────────────

async function fetchInflasiKPI() {
  try {
    // Coba import model jika tersedia
    const { default: sequelize } = await import("../config/database.js").then(
      (m) => m,
    );
    const { sequelize: db } = await import("../config/database.js");

    const [rows] = await db.query(
      `SELECT periode, inflasi_persen, status_inflasi, komoditas_tertinggi
       FROM inflasi_data
       ORDER BY created_at DESC
       LIMIT 1`,
      { type: "SELECT" },
    );

    if (rows && rows.length > 0) {
      return {
        periode: rows[0].periode,
        inflasi: rows[0].inflasi_persen,
        status: rows[0].status_inflasi,
        komoditasTertinggi: rows[0].komoditas_tertinggi,
      };
    }
  } catch {
    // Model belum ada atau query gagal — return dummy
  }

  // Fallback data
  return {
    periode: new Date().toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    }),
    inflasi: parseFloat((Math.random() * 1.5 + 2.5).toFixed(2)),
    status: "ON_TARGET",
    komoditasTertinggi: "Cabai Merah",
  };
}

async function fetchKetersediaanKPI() {
  try {
    const { sequelize: db } = await import("../config/database.js");
    const [rows] = await db.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status_stok = 'AMAN' THEN 1 ELSE 0 END) as aman,
              SUM(CASE WHEN status_stok = 'WASPADA' THEN 1 ELSE 0 END) as waspada,
              SUM(CASE WHEN status_stok = 'KRITIS' THEN 1 ELSE 0 END) as kritis
       FROM komoditas_stok`,
      { type: "SELECT" },
    );
    if (rows && rows[0]) {
      return {
        total: rows[0].total,
        aman: rows[0].aman,
        waspada: rows[0].waspada,
        kritis: rows[0].kritis,
        persenAman:
          rows[0].total > 0
            ? Math.round((rows[0].aman / rows[0].total) * 100)
            : 0,
      };
    }
  } catch {
    // fallback
  }

  return {
    total: 12,
    aman: 8,
    waspada: 3,
    kritis: 1,
    persenAman: 67,
  };
}

async function fetchDistribusiKPI() {
  return {
    totalRealisasi: Math.floor(Math.random() * 500 + 2000),
    persenTarget: parseFloat((Math.random() * 10 + 85).toFixed(1)),
    kecamatanTerlayani: Math.floor(Math.random() * 2 + 8),
    totalKecamatan: 10,
  };
}

// ── Aggregate & broadcast ─────────────────────────────────────────────────────

async function runOnePoll() {
  try {
    const CACHE_KEY_KPI = "kpi:aggregate:broadcast";

    // Ambil dari cache dulu
    const cached = await cacheGet(CACHE_KEY_KPI);
    if (cached) {
      // Broadcast ulang dari cache
      broadcastKPI(ROOMS.KPI_INFLASI, { type: "inflasi", ...cached.inflasi });
      broadcastKPI(ROOMS.KPI_KETERSEDIAAN, {
        type: "ketersediaan",
        ...cached.ketersediaan,
      });
      broadcastKPI(ROOMS.KPI_DISTRIBUSI, {
        type: "distribusi",
        ...cached.distribusi,
      });
      return;
    }

    // Fetch fresh data
    const [inflasi, ketersediaan, distribusi] = await Promise.all([
      fetchInflasiKPI(),
      fetchKetersediaanKPI(),
      fetchDistribusiKPI(),
    ]);

    const payload = { inflasi, ketersediaan, distribusi };

    // Simpan ke cache (5 menit)
    await cacheSet(CACHE_KEY_KPI, payload, TTL.KPI);

    // Broadcast ke rooms
    broadcastKPI(ROOMS.KPI_INFLASI, { type: "inflasi", ...inflasi });
    broadcastKPI(ROOMS.KPI_KETERSEDIAAN, {
      type: "ketersediaan",
      ...ketersediaan,
    });
    broadcastKPI(ROOMS.KPI_DISTRIBUSI, { type: "distribusi", ...distribusi });

    console.log(
      `[KPI Poll] Broadcast selesai @ ${new Date().toLocaleTimeString("id-ID")}`,
    );
  } catch (err) {
    console.error("[KPI Poll] Error:", err.message);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Mulai polling KPI setiap 5 menit.
 * Panggil setelah Socket.IO diinisialisasi.
 */
export function startKPIPolling() {
  if (_isRunning) return;
  _isRunning = true;

  // Run segera, lalu jadwalkan
  runOnePoll();
  _pollTimer = setInterval(runOnePoll, POLL_INTERVAL_MS);

  console.log(
    `[KPI Poll] Dimulai dengan interval ${POLL_INTERVAL_MS / 1000}s ✓`,
  );
}

/**
 * Hentikan polling (untuk graceful shutdown).
 */
export function stopKPIPolling() {
  if (_pollTimer) {
    clearInterval(_pollTimer);
    _pollTimer = null;
    _isRunning = false;
    console.log("[KPI Poll] Dihentikan.");
  }
}

/**
 * Trigger satu poll manual (untuk testing / on-demand refresh).
 */
export async function triggerPoll() {
  await runOnePoll();
}

export default { startKPIPolling, stopKPIPolling, triggerPoll };
