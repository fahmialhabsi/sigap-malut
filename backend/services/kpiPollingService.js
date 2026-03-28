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
  try {
    const { sequelize: db } = await import("../config/database.js");
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const [[realisasiRow], [totalRow], [kecamatanRow]] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as cnt FROM workflow_instances
         WHERE modul_id LIKE 'BDS%'
           AND status NOT IN ('ditolak','closed')
           AND deleted_at IS NULL
           AND created_at >= :since`,
        { replacements: { since: since30d }, type: "SELECT" },
      ),
      db.query(
        `SELECT COUNT(*) as cnt FROM workflow_instances
         WHERE modul_id LIKE 'BDS%'
           AND deleted_at IS NULL
           AND created_at >= :since`,
        { replacements: { since: since30d }, type: "SELECT" },
      ),
      db.query(
        `SELECT COUNT(DISTINCT COALESCE(unit_kerja, 'unknown')) as kecamatan
         FROM workflow_instances
         WHERE modul_id LIKE 'BDS%'
           AND status NOT IN ('ditolak','closed')
           AND deleted_at IS NULL
           AND created_at >= :since`,
        { replacements: { since: since30d }, type: "SELECT" },
      ),
    ]).catch(() => [[{ cnt: 0 }], [{ cnt: 0 }], [{ kecamatan: 0 }]]);

    const realisasi = parseInt(realisasiRow?.cnt ?? 0, 10);
    const total = parseInt(totalRow?.cnt ?? 0, 10);
    const kecamatan = Math.min(parseInt(kecamatanRow?.kecamatan ?? 0, 10), 10);
    const persenTarget = total > 0 ? parseFloat(((realisasi / total) * 100).toFixed(1)) : 0;

    return {
      totalRealisasi: realisasi,
      persenTarget: Math.min(persenTarget, 100),
      kecamatanTerlayani: kecamatan,
      totalKecamatan: 10,
    };
  } catch {
    return { totalRealisasi: 0, persenTarget: 0, kecamatanTerlayani: 0, totalKecamatan: 10 };
  }
}

async function fetchKasubagKPI() {
  try {
    const { sequelize: db } = await import("../config/database.js");
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const [[taskRow], [suratRow]] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as cnt FROM tasks
         WHERE status NOT IN ('done','selesai') AND deleted_at IS NULL
         AND created_at >= :since`,
        { replacements: { since: since30d }, type: "SELECT" },
      ),
      db.query(
        `SELECT COUNT(*) as cnt FROM surat_masuk
         WHERE status = 'masuk' AND deleted_at IS NULL`,
        { type: "SELECT" },
      ),
    ]).catch(() => [[{ cnt: 0 }], [{ cnt: 0 }]]);

    return {
      tugasPending: parseInt(taskRow?.cnt ?? 0, 10),
      suratMasukBelumDisposisi: parseInt(suratRow?.cnt ?? 0, 10),
    };
  } catch {
    return { tugasPending: 0, suratMasukBelumDisposisi: 0 };
  }
}

async function fetchKasiUPTDKPI() {
  try {
    const { sequelize: db } = await import("../config/database.js");
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const [antrianRow] = await db
      .query(
        `SELECT COUNT(*) as cnt FROM tasks
         WHERE status NOT IN ('done','selesai','verified')
           AND deleted_at IS NULL AND created_at >= :since`,
        { replacements: { since: since30d }, type: "SELECT" },
      )
      .catch(() => [{ cnt: 0 }]);

    return {
      antrianVerifikasi: parseInt(antrianRow?.cnt ?? 0, 10),
    };
  } catch {
    return { antrianVerifikasi: 0 };
  }
}

async function fetchFungsionalBidangKPI(prefix) {
  try {
    const { sequelize: db } = await import("../config/database.js");
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const [row] = await db
      .query(
        `SELECT COUNT(*) as cnt FROM workflow_instances
         WHERE modul_id LIKE :prefix
           AND status NOT IN ('approved','ditolak','closed')
           AND deleted_at IS NULL`,
        { replacements: { prefix: `${prefix.toUpperCase()}%` }, type: "SELECT" },
      )
      .catch(() => [{ cnt: 0 }]);

    return {
      laporanMenungguVerifikasi: parseInt(row?.cnt ?? 0, 10),
      bidang: prefix,
    };
  } catch {
    return { laporanMenungguVerifikasi: 0, bidang: prefix };
  }
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

    // Fetch KPI untuk Kasubag, Kasi UPTD, dan Fungsional per Bidang
    const [kasubagKpi, kasiUptdKpi, fungsionalKtKpi, fungsionalDisKpi, fungsionalKonKpi] =
      await Promise.all([
        fetchKasubagKPI().catch(() => null),
        fetchKasiUPTDKPI().catch(() => null),
        fetchFungsionalBidangKPI("bkt").catch(() => null),
        fetchFungsionalBidangKPI("bds").catch(() => null),
        fetchFungsionalBidangKPI("bks").catch(() => null),
      ]);

    // Broadcast ke rooms
    broadcastKPI(ROOMS.KPI_INFLASI, { type: "inflasi", ...inflasi });
    broadcastKPI(ROOMS.KPI_KETERSEDIAAN, { type: "ketersediaan", ...ketersediaan });
    broadcastKPI(ROOMS.KPI_DISTRIBUSI, { type: "distribusi", ...distribusi });
    if (kasubagKpi) broadcastKPI(ROOMS.KPI_KASUBAG, { type: "kasubag", ...kasubagKpi });
    if (kasiUptdKpi) broadcastKPI(ROOMS.KPI_UPTD, { type: "kasi-uptd", ...kasiUptdKpi });
    if (fungsionalKtKpi) broadcastKPI(ROOMS.KPI_KETERSEDIAAN, { type: "fungsional-ketersediaan", ...fungsionalKtKpi });
    if (fungsionalDisKpi) broadcastKPI(ROOMS.KPI_DISTRIBUSI, { type: "fungsional-distribusi", ...fungsionalDisKpi });
    if (fungsionalKonKpi) broadcastKPI(ROOMS.KPI_KONSUMSI, { type: "fungsional-konsumsi", ...fungsionalKonKpi });

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
