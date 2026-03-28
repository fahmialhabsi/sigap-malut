// backend/controllers/dashboardGubernurController.js
// KPI endpoints untuk Dashboard Gubernur dan Kepala Dinas

import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Perintah from "../models/Perintah.js";
import AuditLog from "../models/auditLog.js";
import ApprovalLog from "../models/approvalLog.js";

// ── helpers ───────────────────────────────────────────────────────────────
const safe = (val, fallback = 0) => (val === null || val === undefined ? fallback : val);
const NOW = () => new Date();
const DAYS_AGO = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

// ── GET /api/dashboard/gubernur/summary ──────────────────────────────────
export async function getGubernurKPISummary(req, res) {
  try {
    const dialect = sequelize.getDialect();

    // 1. Perintah aktif dari Gubernur (status != selesai/ditolak)
    const perintahAktif = await Perintah.count({
      where: {
        dari_role: "gubernur",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deleted_at: null,
      },
    }).catch(() => 0);

    // 2. Perintah overdue (deadline lewat, belum selesai)
    const perintahOverdue = await Perintah.count({
      where: {
        dari_role: "gubernur",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deadline: { [Op.lt]: NOW() },
        deleted_at: null,
      },
    }).catch(() => 0);

    // 3. Approval pending (diajukan ke Gubernur)
    const approvalPending = await Perintah.count({
      where: { ke_role: "gubernur", status: "diajukan", deleted_at: null },
    }).catch(() => 0);

    // 4. Stok pangan — coba ambil dari BKT-PGD
    let stokPanganHari = null;
    try {
      const [row] = await sequelize.query(
        `SELECT AVG(stok_hari) AS rata FROM "BKT_PGDs" WHERE created_at >= :since LIMIT 1`,
        { replacements: { since: DAYS_AGO(30) }, type: sequelize.QueryTypes.SELECT },
      );
      stokPanganHari = row?.rata ? parseFloat(row.rata).toFixed(0) : null;
    } catch (_) { /* tabel belum ada / kosong */ }

    // 5. Inflasi pangan — coba BDS-HRG
    let inflasiPangan = null;
    try {
      const [row] = await sequelize.query(
        `SELECT AVG(harga_eceran) AS avg_harga_baru,
                (SELECT AVG(harga_eceran) FROM "BDS_HRGs" WHERE created_at < :since30 AND created_at >= :since60) AS avg_harga_lama
         FROM "BDS_HRGs" WHERE created_at >= :since30`,
        {
          replacements: { since30: DAYS_AGO(30), since60: DAYS_AGO(60) },
          type: sequelize.QueryTypes.SELECT,
        },
      );
      if (row?.avg_harga_baru && row?.avg_harga_lama && row.avg_harga_lama > 0) {
        inflasiPangan = (((row.avg_harga_baru - row.avg_harga_lama) / row.avg_harga_lama) * 100).toFixed(2);
      }
    } catch (_) { /* ok */ }

    // 6. Kabupaten rawan pangan — coba BKT-KRW
    let kabRawan = null;
    try {
      const [row] = await sequelize.query(
        `SELECT COUNT(DISTINCT kabupaten) AS total FROM "BKT_KRWs" WHERE status_kerawanan IN ('rawan','kritis') AND created_at >= :since`,
        { replacements: { since: DAYS_AGO(90) }, type: sequelize.QueryTypes.SELECT },
      );
      kabRawan = parseInt(row?.total || 0);
    } catch (_) { /* ok */ }

    // 7. UPTD Aktif — coba UPT-ADM
    let uptdAktif = null;
    let uptdTotal = null;
    try {
      const [row] = await sequelize.query(
        `SELECT COUNT(*) FILTER (WHERE status='aktif') AS aktif, COUNT(*) AS total FROM "UPT_ADMs"`,
        { type: sequelize.QueryTypes.SELECT },
      );
      uptdAktif = parseInt(row?.aktif || 0);
      uptdTotal = parseInt(row?.total || 0);
    } catch (_) {
      // SQLite fallback
      try {
        const [rowA] = await sequelize.query(
          `SELECT COUNT(*) AS aktif FROM UPT_ADMs WHERE status='aktif'`,
          { type: sequelize.QueryTypes.SELECT },
        );
        const [rowT] = await sequelize.query(
          `SELECT COUNT(*) AS total FROM UPT_ADMs`,
          { type: sequelize.QueryTypes.SELECT },
        );
        uptdAktif = parseInt(rowA?.aktif || 0);
        uptdTotal = parseInt(rowT?.total || 0);
      } catch (_) { /* ok */ }
    }

    // 8. Realisasi anggaran — audit_log proxy
    const totalAudit30d = await AuditLog.count({
      where: { created_at: { [Op.gte]: DAYS_AGO(30) } },
    }).catch(() => 0);

    res.json({
      success: true,
      data: {
        perintahAktif: safe(perintahAktif),
        perintahOverdue: safe(perintahOverdue),
        approvalPending: safe(approvalPending),
        stokPanganHari: stokPanganHari,           // null = data belum tersedia
        inflasiPangan: inflasiPangan,              // null = data belum tersedia
        kabRawan: kabRawan,
        uptdAktif: uptdAktif,
        uptdTotal: uptdTotal,
        aktivitasSistem30d: safe(totalAudit30d),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/gubernur/kinerja-kadin ────────────────────────────
export async function getKinerjaKaDin(req, res) {
  try {
    // Perintah outgoing dari Gubernur ke KaDin
    const totalPerintahKe = await Perintah.count({
      where: { dari_role: "gubernur", ke_role: "kepala_dinas", deleted_at: null },
    }).catch(() => 0);

    const perintahSelesai = await Perintah.count({
      where: { dari_role: "gubernur", ke_role: "kepala_dinas", status: { [Op.in]: ["selesai", "disetujui"] }, deleted_at: null },
    }).catch(() => 0);

    const perintahOverdue = await Perintah.count({
      where: {
        dari_role: "gubernur", ke_role: "kepala_dinas",
        status: { [Op.notIn]: ["selesai", "disetujui", "ditolak"] },
        deadline: { [Op.lt]: NOW() },
        deleted_at: null,
      },
    }).catch(() => 0);

    const perintahTakRespons = await Perintah.count({
      where: {
        dari_role: "gubernur", ke_role: "kepala_dinas",
        status: "terkirim",
        created_at: { [Op.lt]: DAYS_AGO(2) },
        deleted_at: null,
      },
    }).catch(() => 0);

    const selesaiRate = totalPerintahKe > 0
      ? ((perintahSelesai / totalPerintahKe) * 100).toFixed(1)
      : null;

    res.json({
      success: true,
      data: {
        totalPerintah: totalPerintahKe,
        perintahSelesai,
        perintahOverdue,
        perintahTakRespons,
        selesaiRate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/gubernur/ikp-map ──────────────────────────────────
export async function getIKPMap(req, res) {
  // Maluku Utara 10 Kab/Kota — static with data overlay
  const kabKota = [
    { id: "ternate", nama: "Kota Ternate" },
    { id: "tidore", nama: "Kota Tidore Kepulauan" },
    { id: "halbar", nama: "Halmahera Barat" },
    { id: "haltim", nama: "Halmahera Timur" },
    { id: "halsel", nama: "Halmahera Selatan" },
    { id: "halut", nama: "Halmahera Utara" },
    { id: "halteng", nama: "Halmahera Tengah" },
    { id: "kepsula", nama: "Kepulauan Sula" },
    { id: "taliabu", nama: "Pulau Taliabu" },
    { id: "morotai", nama: "Morotai" },
  ];

  // Try to get real data from BKT-KRW
  let kraData = {};
  try {
    const rows = await sequelize.query(
      `SELECT kabupaten, status_kerawanan, skor_ikp FROM "BKT_KRWs"
       WHERE created_at >= :since ORDER BY created_at DESC`,
      { replacements: { since: DAYS_AGO(90) }, type: sequelize.QueryTypes.SELECT },
    );
    rows.forEach((r) => {
      if (!kraData[r.kabupaten]) kraData[r.kabupaten] = r;
    });
  } catch (_) { /* ok */ }

  const data = kabKota.map((k) => ({
    ...k,
    ikp: kraData[k.id]?.skor_ikp || null,
    status: kraData[k.id]?.status_kerawanan || "unknown",
  }));

  res.json({ success: true, data });
}

// ── GET /api/dashboard/gubernur/approval-queue ───────────────────────────
export async function getGubernurApprovalQueue(req, res) {
  try {
    const queue = await Perintah.findAll({
      where: { ke_role: "gubernur", status: "diajukan", deleted_at: null },
      order: [["created_at", "ASC"]],
      limit: 20,
    });
    res.json({ success: true, data: queue, total: queue.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/gubernur/alerts ───────────────────────────────────
export async function getGubernurAlerts(req, res) {
  try {
    const alerts = [];

    // Perintah overdue
    const overdue = await Perintah.findAll({
      where: {
        dari_role: "gubernur",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deadline: { [Op.lt]: NOW() },
        deleted_at: null,
      },
      limit: 5,
    }).catch(() => []);
    overdue.forEach((p) => alerts.push({
      level: "kritis",
      tipe: "perintah_overdue",
      pesan: `Perintah "${p.judul}" telah melewati deadline`,
      referensi_id: p.id,
    }));

    // Perintah > 2 hari tidak direspon KaDin
    const tidakRespon = await Perintah.findAll({
      where: {
        dari_role: "gubernur", ke_role: "kepala_dinas",
        status: "terkirim",
        created_at: { [Op.lt]: DAYS_AGO(2) },
        deleted_at: null,
      },
      limit: 5,
    }).catch(() => []);
    tidakRespon.forEach((p) => alerts.push({
      level: "peringatan",
      tipe: "tidak_direspon",
      pesan: `Perintah "${p.judul}" belum direspon KaDin > 2 hari`,
      referensi_id: p.id,
    }));

    res.json({ success: true, data: alerts, total: alerts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/kepala-dinas/summary ──────────────────────────────
export async function getKadinKPISummary(req, res) {
  try {
    const perintahMasukAktif = await Perintah.count({
      where: {
        ke_role: "kepala_dinas",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deleted_at: null,
      },
    }).catch(() => 0);

    const perintahKeluarAktif = await Perintah.count({
      where: {
        dari_role: "kepala_dinas",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deleted_at: null,
      },
    }).catch(() => 0);

    const approvalPending = await Perintah.count({
      where: { ke_role: "kepala_dinas", status: "diajukan", deleted_at: null },
    }).catch(() => 0);

    const perintahOverdue = await Perintah.count({
      where: {
        ke_role: "kepala_dinas",
        status: { [Op.notIn]: ["selesai", "ditolak", "disetujui"] },
        deadline: { [Op.lt]: NOW() },
        deleted_at: null,
      },
    }).catch(() => 0);

    res.json({
      success: true,
      data: {
        perintahMasukAktif: safe(perintahMasukAktif),
        perintahKeluarAktif: safe(perintahKeluarAktif),
        approvalPending: safe(approvalPending),
        perintahOverdue: safe(perintahOverdue),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/kepala-dinas/kinerja-bawahan ──────────────────────
export async function getKinerjaBawahan(req, res) {
  try {
    const bawahan = [
      "sekretaris", "kepala_bidang_ketersediaan", "kepala_bidang_distribusi",
      "kepala_bidang_konsumsi", "kepala_uptd",
    ];

    const result = await Promise.all(bawahan.map(async (role) => {
      const total = await Perintah.count({
        where: { dari_role: "kepala_dinas", ke_role: role, deleted_at: null },
      }).catch(() => 0);
      const selesai = await Perintah.count({
        where: { dari_role: "kepala_dinas", ke_role: role, status: { [Op.in]: ["selesai", "disetujui"] }, deleted_at: null },
      }).catch(() => 0);
      const overdue = await Perintah.count({
        where: {
          dari_role: "kepala_dinas", ke_role: role,
          status: { [Op.notIn]: ["selesai", "disetujui", "ditolak"] },
          deadline: { [Op.lt]: NOW() },
          deleted_at: null,
        },
      }).catch(() => 0);
      return { role, total, selesai, overdue, rate: total > 0 ? ((selesai / total) * 100).toFixed(1) : null };
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── GET /api/dashboard/kepala-dinas/approval-queue ───────────────────────
export async function getKadinApprovalQueue(req, res) {
  try {
    const queue = await Perintah.findAll({
      where: { ke_role: "kepala_dinas", status: "diajukan", deleted_at: null },
      order: [["created_at", "ASC"]],
      limit: 20,
    });
    res.json({ success: true, data: queue, total: queue.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
