/**
 * backend/controllers/dashboardController.js
 *
 * Real KPI endpoints untuk Dashboard SIGAP MALUT:
 *  GET /api/dashboard/sekretaris/summary  — 5 KPI wajib sekretaris
 *  GET /api/inflasi/latest               — inflasi pangan weighted
 *  GET /api/komoditas/stock              — stok & harga per komoditas
 */

import { Op, fn, col, literal, where } from "sequelize";
import sequelize from "../config/database.js";
import AuditLog from "../models/auditLog.js";
import ApprovalLog from "../models/approvalLog.js";
import ApprovalWorkflow from "../models/approvalWorkflow.js";
import Komoditas from "../models/komoditas.js";
import BdsHrg from "../models/BDS-HRG.js";

// ── helpers ───────────────────────────────────────────────────────────────────

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

const SIX_MONTHS_AGO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

/**
 * Dialect-safe TIMESTAMPDIFF in minutes.
 * SQLite: (julianday(end) - julianday(start)) * 1440
 * PostgreSQL: EXTRACT(EPOCH FROM (end - start)) / 60
 */
function diffMinutesExpr(endCol, startCol) {
  const dialect = sequelize.getDialect();
  if (dialect === "postgres") {
    return literal(`EXTRACT(EPOCH FROM ("${endCol}" - "${startCol}")) / 60`);
  }
  // sqlite
  return literal(`(julianday("${endCol}") - julianday("${startCol}")) * 1440`);
}

// ── KPI 1 & 2 : Compliance & Zero Bypass (audit_log) ─────────────────────────
async function getComplianceKPIs() {
  const since30d = THIRTY_DAYS_AGO();

  // Total transaksi (CREATE + UPDATE + DELETE) in 30d
  const totalTransaksi = await AuditLog.count({
    where: {
      created_at: { [Op.gte]: since30d },
    },
  });

  // Bypass events — aksi field contains 'BYPASS' (case-insensitive)
  // or modul starts with 'BYPASS'
  const bypassEvents = await AuditLog.count({
    where: {
      created_at: { [Op.gte]: since30d },
      [Op.or]: [
        { aksi: { [Op.like]: "%BYPASS%" } },
        { modul: { [Op.like]: "%BYPASS%" } },
      ],
    },
  });

  const complianceRate =
    totalTransaksi > 0
      ? parseFloat(
          (((totalTransaksi - bypassEvents) / totalTransaksi) * 100).toFixed(2),
        )
      : 100.0;

  return {
    complianceAlurKoordinasi: complianceRate, // %
    zeroBypassViolations30d: bypassEvents, // count
    totalTransaksi30d: totalTransaksi,
  };
}

// ── KPI 3 : Avg Approval Time ─────────────────────────────────────────────────
async function getAvgApprovalTime() {
  // ApprovalWorkflow: submitted_at → status='approved'
  // We need to find workflows that reached status 'approved' and measure
  // time from submitted_at to the corresponding updated approval_log timestamp.
  // Simplest correct approach: find distinct layanan_id that have both
  // an "approved" action in approval_log and a submitted_at in approval_workflow.

  try {
    const dialect = sequelize.getDialect();

    if (dialect === "postgres") {
      const [result] = await sequelize.query(`
        SELECT
          AVG(
            EXTRACT(EPOCH FROM (al.timestamp - aw.submitted_at)) / 3600
          ) AS avg_hours
        FROM approval_log al
        JOIN approval_workflow aw
          ON al.layanan_id::text = aw.record_id::text
        WHERE al.action = 'approved'
          AND aw.submitted_at >= NOW() - INTERVAL '30 days'
          AND aw.deleted_at IS NULL
        LIMIT 1
      `);
      return parseFloat(result?.[0]?.avg_hours || 0).toFixed(1);
    } else {
      // SQLite
      const [result] = await sequelize.query(`
        SELECT
          AVG(
            (julianday(al.timestamp) - julianday(aw.submitted_at)) * 24
          ) AS avg_hours
        FROM approval_log al
        JOIN approval_workflow aw
          ON CAST(al.layanan_id AS TEXT) = CAST(aw.record_id AS TEXT)
        WHERE al.action = 'approved'
          AND aw.submitted_at >= datetime('now', '-30 days')
          AND aw.deleted_at IS NULL
        LIMIT 1
      `);
      return parseFloat(result?.[0]?.avg_hours || 0).toFixed(1);
    }
  } catch {
    return null; // safely degrade if join fails
  }
}

// ── KPI 4 : Konsistensi Data Komoditas ────────────────────────────────────────
async function getKonsistensiKomoditas() {
  // "verified" = komoditas has at least one bds_hrg record this month
  // (i.e., has been pantau-ed and reported)
  const thisMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const totalKomoditas = await Komoditas.count();

  const verifiedIds = await BdsHrg.findAll({
    attributes: [[fn("DISTINCT", col("komoditas_id")), "komoditas_id"]],
    where: {
      periode: { [Op.gte]: thisMonthStart },
      komoditas_id: { [Op.ne]: null },
    },
    raw: true,
  });

  const verifiedCount = verifiedIds.length;
  const konsistensiRate =
    totalKomoditas > 0
      ? parseFloat(((verifiedCount / totalKomoditas) * 100).toFixed(2))
      : 0;

  return {
    konsistensiDataKomoditas: konsistensiRate, // %
    komoditasVerified: verifiedCount,
    komoditasTotal: totalKomoditas,
  };
}

// ── KPI 5 : Inflasi Pangan (weighted price change %) ─────────────────────────
async function getInflasiPangan() {
  // Weighted average of persentase_perubahan from bds_hrg for current month
  // Weight = harga (price level)
  const thisMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  try {
    let avgInflasi = 0;
    const dialect = sequelize.getDialect();

    if (dialect === "postgres") {
      const [result] = await sequelize.query(
        `
        SELECT
          SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS weighted_inflasi,
          AVG(persentase_perubahan) AS simple_avg,
          COUNT(*) AS data_points
        FROM bds_hrg
        WHERE periode >= :since
          AND persentase_perubahan IS NOT NULL
          AND harga IS NOT NULL
          AND harga > 0
      `,
        {
          replacements: { since: thisMonthStart },
          type: sequelize.QueryTypes.SELECT,
        },
      );
      avgInflasi = parseFloat(
        result?.weighted_inflasi || result?.simple_avg || 0,
      );
    } else {
      const [result] = await sequelize.query(
        `
        SELECT
          SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS weighted_inflasi,
          AVG(persentase_perubahan) AS simple_avg,
          COUNT(*) AS data_points
        FROM bds_hrg
        WHERE periode >= :since
          AND persentase_perubahan IS NOT NULL
          AND harga IS NOT NULL
          AND harga > 0
      `,
        {
          replacements: { since: thisMonthStart.toISOString().slice(0, 10) },
          type: sequelize.QueryTypes.SELECT,
        },
      );
      avgInflasi = parseFloat(
        result?.weighted_inflasi || result?.simple_avg || 0,
      );
    }

    return parseFloat(avgInflasi.toFixed(2));
  } catch {
    return null;
  }
}

// ── CONTROLLER: GET /api/dashboard/sekretaris/summary ────────────────────────
export const getSekretarisSummary = async (req, res) => {
  try {
    const [compliance, avgApprovalHours, konsistensi, inflasiPangan] =
      await Promise.all([
        getComplianceKPIs(),
        getAvgApprovalTime(),
        getKonsistensiKomoditas(),
        getInflasiPangan(),
      ]);

    const data = {
      complianceAlurKoordinasi: compliance.complianceAlurKoordinasi,
      zeroBypassViolations30d: compliance.zeroBypassViolations30d,
      totalTransaksi30d: compliance.totalTransaksi30d,
      avgApprovalTimeHours:
        avgApprovalHours !== null ? parseFloat(avgApprovalHours) : null,
      konsistensiDataKomoditas: konsistensi.konsistensiDataKomoditas,
      komoditasVerified: konsistensi.komoditasVerified,
      komoditasTotal: konsistensi.komoditasTotal,
      inflasiPangan: inflasiPangan,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil KPI Sekretaris",
      error: error.message,
    });
  }
};

// ── CONTROLLER: GET /api/inflasi/latest ──────────────────────────────────────
export const getInflasiLatest = async (req, res) => {
  try {
    // Latest month with data
    const latestRecord = await BdsHrg.findOne({
      where: { persentase_perubahan: { [Op.ne]: null } },
      order: [["periode", "DESC"]],
      attributes: ["periode", "tahun", "bulan"],
      raw: true,
    });

    if (!latestRecord) {
      return res.json({
        success: true,
        data: {
          periode: null,
          inflasiPangan: null,
          contributors: [],
          tren6Bulan: [],
          message: "Belum ada data harga komoditas",
        },
      });
    }

    const { tahun, bulan } = latestRecord;

    // Weighted inflasi for latest month
    const dialect = sequelize.getDialect();
    let inflasiQuery;
    if (dialect === "postgres") {
      inflasiQuery = `
        SELECT
          nama_komoditas,
          AVG(harga) AS avg_harga,
          AVG(harga_bulan_lalu) AS avg_harga_lalu,
          SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS inflasi_weighted,
          AVG(persentase_perubahan) AS inflasi_avg,
          tren_harga
        FROM bds_hrg
        WHERE tahun = :tahun AND bulan = :bulan
          AND nama_komoditas IS NOT NULL
        GROUP BY nama_komoditas, tren_harga
        ORDER BY inflasi_weighted DESC NULLS LAST
        LIMIT 10
      `;
    } else {
      inflasiQuery = `
        SELECT
          nama_komoditas,
          AVG(harga) AS avg_harga,
          AVG(harga_bulan_lalu) AS avg_harga_lalu,
          SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS inflasi_weighted,
          AVG(persentase_perubahan) AS inflasi_avg,
          tren_harga
        FROM bds_hrg
        WHERE tahun = :tahun AND bulan = :bulan
          AND nama_komoditas IS NOT NULL
        GROUP BY nama_komoditas, tren_harga
        ORDER BY inflasi_weighted DESC
        LIMIT 10
      `;
    }

    const contributors = await sequelize.query(inflasiQuery, {
      replacements: { tahun, bulan },
      type: sequelize.QueryTypes.SELECT,
    });

    // Tren 6 bulan — group by (year, month)
    const trenQuery =
      dialect === "postgres"
        ? `
      SELECT
        tahun,
        bulan,
        SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS inflasi
      FROM bds_hrg
      WHERE periode >= NOW() - INTERVAL '6 months'
        AND persentase_perubahan IS NOT NULL
        AND harga IS NOT NULL AND harga > 0
      GROUP BY tahun, bulan
      ORDER BY tahun, bulan
    `
        : `
      SELECT
        tahun,
        bulan,
        SUM(persentase_perubahan * harga) / NULLIF(SUM(harga), 0) AS inflasi
      FROM bds_hrg
      WHERE periode >= date('now', '-6 months')
        AND persentase_perubahan IS NOT NULL
        AND harga IS NOT NULL AND harga > 0
      GROUP BY tahun, bulan
      ORDER BY tahun, bulan
    `;

    const trenRows = await sequelize.query(trenQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    const BULAN_NAMES = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const tren6Bulan = trenRows.map((r) => ({
      label: `${BULAN_NAMES[r.bulan]} ${r.tahun}`,
      inflasi: parseFloat((r.inflasi || 0).toFixed(2)),
    }));

    // Overall weighted inflasi for the month
    const overallInflasi =
      contributors.reduce(
        (sum, c) => sum + (parseFloat(c.inflasi_weighted) || 0),
        0,
      ) / (contributors.length || 1);

    res.json({
      success: true,
      data: {
        periode: `${BULAN_NAMES[bulan]} ${tahun}`,
        tahun,
        bulan,
        inflasiPangan: parseFloat(overallInflasi.toFixed(2)),
        contributors: contributors.map((c) => ({
          nama: c.nama_komoditas,
          harga: parseFloat(c.avg_harga || 0),
          hargaBulanLalu: parseFloat(c.avg_harga_lalu || 0),
          kontribusi: parseFloat(
            c.inflasi_weighted || c.inflasi_avg || 0,
          ).toFixed(2),
          tren: c.tren_harga,
        })),
        tren6Bulan,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data inflasi",
      error: error.message,
    });
  }
};

// ── CONTROLLER: GET /api/komoditas/stock ─────────────────────────────────────
export const getKomoditasStock = async (req, res) => {
  try {
    // Master komoditas list
    const komoditasList = await Komoditas.findAll({
      attributes: ["id", "nama", "satuan", "kode"],
      order: [["nama", "ASC"]],
      raw: true,
    });

    // Latest harga per komoditas (latest periode)
    const dialect = sequelize.getDialect();
    const hargaQuery =
      dialect === "postgres"
        ? `
      SELECT DISTINCT ON (komoditas_id)
        komoditas_id,
        nama_komoditas,
        harga,
        harga_bulan_lalu,
        persentase_perubahan,
        tren_harga,
        tingkat_fluktuasi,
        periode,
        nama_pasar
      FROM bds_hrg
      WHERE komoditas_id IS NOT NULL
      ORDER BY komoditas_id, periode DESC
    `
        : `
      SELECT
        b.komoditas_id,
        b.nama_komoditas,
        b.harga,
        b.harga_bulan_lalu,
        b.persentase_perubahan,
        b.tren_harga,
        b.tingkat_fluktuasi,
        b.periode,
        b.nama_pasar
      FROM bds_hrg b
      INNER JOIN (
        SELECT komoditas_id, MAX(periode) AS max_periode
        FROM bds_hrg
        WHERE komoditas_id IS NOT NULL
        GROUP BY komoditas_id
      ) latest ON b.komoditas_id = latest.komoditas_id
                AND b.periode = latest.max_periode
    `;

    const hargaRows = await sequelize.query(hargaQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Map harga info to komoditas
    const hargaMap = {};
    for (const h of hargaRows) {
      if (!hargaMap[h.komoditas_id]) hargaMap[h.komoditas_id] = h;
    }

    const result = komoditasList.map((k) => {
      const h = hargaMap[k.id];
      return {
        id: k.id,
        nama: k.nama,
        satuan: k.satuan || "kg",
        kode: k.kode,
        harga: h ? parseFloat(h.harga || 0) : null,
        hargaBulanLalu: h ? parseFloat(h.harga_bulan_lalu || 0) : null,
        perubahanPct: h ? parseFloat(h.persentase_perubahan || 0) : null,
        tren: h?.tren_harga || null,
        fluktuasi: h?.tingkat_fluktuasi || null,
        periodeData: h?.periode || null,
        verified: !!h, // has data this period = verified
      };
    });

    const totalVerified = result.filter((k) => k.verified).length;
    const konsistensiPct =
      result.length > 0
        ? parseFloat(((totalVerified / result.length) * 100).toFixed(2))
        : 0;

    res.json({
      success: true,
      data: {
        komoditas: result,
        summary: {
          total: result.length,
          verified: totalVerified,
          konsistensiPct,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data stok komoditas",
      error: error.message,
    });
  }
};
