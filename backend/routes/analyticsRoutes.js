/**
 * backend/routes/analyticsRoutes.js
 *
 * GET /api/analytics/self-service
 * Self-service analytics endpoint untuk filter mandiri oleh Fungsional, Kasubag, Kasi.
 *
 * Query params:
 *   wilayah       — nama wilayah / "Semua Wilayah"
 *   komoditas     — nama komoditas / "Semua Komoditas"
 *   indikator     — harga_rata | stok_volume | inflasi_persen | distribusi_ton | konsumsi_kg
 *   period        — 7d | 1m | 3m | 6m | 1y | custom
 *   tanggalMulai  — (jika period=custom) YYYY-MM-DD
 *   tanggalAkhir  — (jika period=custom) YYYY-MM-DD
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import sequelize from "../config/database.js";

const router = Router();
router.use(protect);

// Allowed roles: semua role yang memiliki dashboard:read
const ALLOWED_PERMISSIONS = ["dashboard:read", "fungsional:read", "fungsional_analis:read",
  "fungsional_perencana:read", "kasubbag_umum_kepegawaian:read", "kasubbag_tu_uptd:read",
  "kasi_mutu_uptd:read", "kasi_teknis_uptd:read"];

// Helper: hitung tanggal mulai dari period
function getPeriodStart(period, tanggalMulai) {
  if (period === "custom" && tanggalMulai) return new Date(tanggalMulai);
  const d = new Date();
  switch (period) {
    case "7d":  d.setDate(d.getDate() - 7); break;
    case "1m":  d.setMonth(d.getMonth() - 1); break;
    case "3m":  d.setMonth(d.getMonth() - 3); break;
    case "6m":  d.setMonth(d.getMonth() - 6); break;
    case "1y":  d.setFullYear(d.getFullYear() - 1); break;
    default:    d.setMonth(d.getMonth() - 3);
  }
  return d;
}

function getPeriodEnd(period, tanggalAkhir) {
  if (period === "custom" && tanggalAkhir) return new Date(tanggalAkhir);
  return new Date();
}

router.get("/self-service", authorize("dashboard:read"), async (req, res) => {
  try {
    const {
      wilayah = "Semua Wilayah",
      komoditas = "Semua Komoditas",
      indikator = "harga_rata",
      period = "3m",
      tanggalMulai,
      tanggalAkhir,
    } = req.query;

    const since = getPeriodStart(period, tanggalMulai);
    const until = getPeriodEnd(period, tanggalAkhir);
    const dialect = sequelize.getDialect();

    let results = [];

    // ── harga_rata ─────────────────────────────────────────────────────────────
    if (indikator === "harga_rata") {
      const komoditasClause =
        komoditas !== "Semua Komoditas"
          ? `AND nama_komoditas = :komoditas`
          : "";

      const query =
        dialect === "postgres"
          ? `SELECT
               TO_CHAR(periode, 'Mon YYYY') AS label,
               AVG(harga) AS nilai,
               AVG(harga_bulan_lalu) AS tahun_lalu
             FROM bds_hrg
             WHERE periode BETWEEN :since AND :until
               ${komoditasClause}
             GROUP BY DATE_TRUNC('month', periode)
             ORDER BY DATE_TRUNC('month', periode)`
          : `SELECT
               strftime('%m/%Y', periode) AS label,
               AVG(harga) AS nilai,
               AVG(harga_bulan_lalu) AS tahun_lalu
             FROM bds_hrg
             WHERE periode BETWEEN :since AND :until
               ${komoditasClause}
             GROUP BY strftime('%Y-%m', periode)
             ORDER BY strftime('%Y-%m', periode)`;

      results = await sequelize
        .query(query, {
          replacements: {
            since: since.toISOString().slice(0, 10),
            until: until.toISOString().slice(0, 10),
            ...(komoditas !== "Semua Komoditas" ? { komoditas } : {}),
          },
          type: sequelize.QueryTypes.SELECT,
        })
        .catch(() => []);
    }

    // ── inflasi_persen ─────────────────────────────────────────────────────────
    else if (indikator === "inflasi_persen") {
      const query =
        dialect === "postgres"
          ? `SELECT
               TO_CHAR(periode, 'Mon YYYY') AS label,
               AVG(persentase_perubahan) AS nilai,
               NULL AS tahun_lalu
             FROM bds_hrg
             WHERE periode BETWEEN :since AND :until
               AND persentase_perubahan IS NOT NULL
             GROUP BY DATE_TRUNC('month', periode)
             ORDER BY DATE_TRUNC('month', periode)`
          : `SELECT
               strftime('%m/%Y', periode) AS label,
               AVG(persentase_perubahan) AS nilai,
               NULL AS tahun_lalu
             FROM bds_hrg
             WHERE periode BETWEEN :since AND :until
               AND persentase_perubahan IS NOT NULL
             GROUP BY strftime('%Y-%m', periode)
             ORDER BY strftime('%Y-%m', periode)`;

      results = await sequelize
        .query(query, {
          replacements: {
            since: since.toISOString().slice(0, 10),
            until: until.toISOString().slice(0, 10),
          },
          type: sequelize.QueryTypes.SELECT,
        })
        .catch(() => []);
    }

    // ── stok_volume — bkt-krw / stok table ────────────────────────────────────
    else if (indikator === "stok_volume") {
      const query =
        dialect === "postgres"
          ? `SELECT
               TO_CHAR(created_at, 'Mon YYYY') AS label,
               SUM(COALESCE(stok_akhir, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bkt_krw
             WHERE created_at BETWEEN :since AND :until
             GROUP BY DATE_TRUNC('month', created_at)
             ORDER BY DATE_TRUNC('month', created_at)`
          : `SELECT
               strftime('%m/%Y', created_at) AS label,
               SUM(COALESCE(stok_akhir, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bkt_krw
             WHERE created_at BETWEEN :since AND :until
             GROUP BY strftime('%Y-%m', created_at)
             ORDER BY strftime('%Y-%m', created_at)`;

      results = await sequelize
        .query(query, {
          replacements: {
            since: since.toISOString(),
            until: until.toISOString(),
          },
          type: sequelize.QueryTypes.SELECT,
        })
        .catch(() => []);
    }

    // ── distribusi_ton — bds-bmb / pengiriman table ────────────────────────────
    else if (indikator === "distribusi_ton") {
      const query =
        dialect === "postgres"
          ? `SELECT
               TO_CHAR(tanggal_pengiriman, 'Mon YYYY') AS label,
               SUM(COALESCE(volume_ton, jumlah_distribusi, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bds_bmb
             WHERE tanggal_pengiriman BETWEEN :since AND :until
             GROUP BY DATE_TRUNC('month', tanggal_pengiriman)
             ORDER BY DATE_TRUNC('month', tanggal_pengiriman)`
          : `SELECT
               strftime('%m/%Y', tanggal_pengiriman) AS label,
               SUM(COALESCE(volume_ton, jumlah_distribusi, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bds_bmb
             WHERE tanggal_pengiriman BETWEEN :since AND :until
             GROUP BY strftime('%Y-%m', tanggal_pengiriman)
             ORDER BY strftime('%Y-%m', tanggal_pengiriman)`;

      results = await sequelize
        .query(query, {
          replacements: {
            since: since.toISOString().slice(0, 10),
            until: until.toISOString().slice(0, 10),
          },
          type: sequelize.QueryTypes.SELECT,
        })
        .catch(() => []);
    }

    // ── konsumsi_kg — bks-kmn / konsumsi table ────────────────────────────────
    else if (indikator === "konsumsi_kg") {
      const query =
        dialect === "postgres"
          ? `SELECT
               TO_CHAR(periode, 'Mon YYYY') AS label,
               SUM(COALESCE(konsumsi_per_kapita, konsumsi_kg, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bks_kmn
             WHERE periode BETWEEN :since AND :until
             GROUP BY DATE_TRUNC('month', periode)
             ORDER BY DATE_TRUNC('month', periode)`
          : `SELECT
               strftime('%m/%Y', periode) AS label,
               SUM(COALESCE(konsumsi_per_kapita, konsumsi_kg, 0)) AS nilai,
               NULL AS tahun_lalu
             FROM bks_kmn
             WHERE periode BETWEEN :since AND :until
             GROUP BY strftime('%Y-%m', periode)
             ORDER BY strftime('%Y-%m', periode)`;

      results = await sequelize
        .query(query, {
          replacements: {
            since: since.toISOString().slice(0, 10),
            until: until.toISOString().slice(0, 10),
          },
          type: sequelize.QueryTypes.SELECT,
        })
        .catch(() => []);
    }

    // Fallback: jika query gagal atau tidak ada data, kembalikan array kosong
    // (frontend akan menampilkan pesan "tidak ada data")
    const formatted = results.map((r) => ({
      label: r.label || "—",
      nilai: r.nilai != null ? parseFloat(Number(r.nilai).toFixed(2)) : 0,
      tahun_lalu:
        r.tahun_lalu != null ? parseFloat(Number(r.tahun_lalu).toFixed(2)) : null,
    }));

    res.json({
      success: true,
      results: formatted,
      meta: {
        indikator,
        wilayah,
        komoditas,
        period,
        since: since.toISOString().slice(0, 10),
        until: until.toISOString().slice(0, 10),
        count: formatted.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data analytics",
      error: error.message,
    });
  }
});

export default router;
