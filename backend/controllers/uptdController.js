import { Op } from "sequelize";
import UjiLaboratorium from "../models/UjiLaboratorium.js";
import SertifikasiPangan from "../models/SertifikasiPangan.js";
import EquipmentMaintenance from "../models/EquipmentMaintenance.js";

function isUptdUser(user) {
  const unit = String(user?.unit_kerja || "").toLowerCase();
  const role = String(user?.role || user?.roleName || "").toLowerCase();
  return unit.includes("uptd") || role.includes("uptd") || role === "kepala_uptd";
}

// GET /api/uptd/dashboard/lab-workload
export async function getLabWorkload(req, res) {
  try {
    if (!isUptdUser(req.user)) {
      return res.status(403).json({ error: "forbidden" });
    }

    const totalQueue = await UjiLaboratorium.count({
      where: { status: { [Op.in]: ["menunggu", "dalam_proses"] } },
    }).catch(() => 0);

    const menunggu = await UjiLaboratorium.count({
      where: { status: "menunggu" },
    }).catch(() => 0);

    const dalamProses = await UjiLaboratorium.count({
      where: { status: "dalam_proses" },
    }).catch(() => 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const selesaiBulanIni = await UjiLaboratorium.count({
      where: {
        status: "selesai",
        tanggal_selesai: { [Op.gte]: startOfMonth.toISOString().slice(0, 10) },
      },
    }).catch(() => 0);

    const sertAktif = await SertifikasiPangan.count({
      where: { status: { [Op.in]: ["aktif", "disetujui"] } },
    }).catch(() => 0);

    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);

    const expiry30 = await SertifikasiPangan.count({
      where: {
        tanggal_kadaluwarsa: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.gte]: now.toISOString().slice(0, 10) },
            { [Op.lte]: in30.toISOString().slice(0, 10) },
          ],
        },
      },
    }).catch(() => 0);

    const expiry7 = await SertifikasiPangan.count({
      where: {
        tanggal_kadaluwarsa: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.gte]: now.toISOString().slice(0, 10) },
            { [Op.lte]: in7.toISOString().slice(0, 10) },
          ],
        },
      },
    }).catch(() => 0);

    // Equipment status: simple heuristik dari tanggal_berikutnya
    const equipments = await EquipmentMaintenance.findAll({
      order: [["tanggal_berikutnya", "ASC"]],
      limit: 200,
    }).catch(() => []);

    let alatOverdue = 0;
    let alatTerjadwal = 0;
    let alatOk = 0;
    for (const e of equipments) {
      const next = e.tanggal_berikutnya ? new Date(e.tanggal_berikutnya) : null;
      if (!next) {
        alatOk += 1;
        continue;
      }
      const diff = next.getTime() - now.getTime();
      if (diff < 0) alatOverdue += 1;
      else if (diff <= 7 * 24 * 3600 * 1000) alatTerjadwal += 1;
      else alatOk += 1;
    }

    return res.json({
      data: {
        updated_at: now.toISOString(),
        sample_queue: {
          total: totalQueue,
          menunggu,
          dalam_proses: dalamProses,
        },
        kpi_bulan_ini: {
          selesai: selesaiBulanIni,
          // placeholder sampai hasil uji terstruktur dipakai untuk pass-rate
          pass_rate_persen: null,
          avg_turnaround_hari: null,
        },
        sertifikasi: {
          aktif: sertAktif,
          expiry_lt_30_hari: expiry30,
          expiry_lt_7_hari: expiry7,
        },
        alat_lab: {
          operasional: alatOk,
          kalibrasi_terjadwal: alatTerjadwal,
          overdue_kalibrasi: alatOverdue,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /api/uptd/dashboard/summary
export async function getUptdSummary(req, res) {
  try {
    if (!isUptdUser(req.user)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const workload = await UjiLaboratorium.count().catch(() => 0);
    const sert = await SertifikasiPangan.count().catch(() => 0);
    return res.json({
      data: {
        uji_total: workload,
        sertifikasi_total: sert,
      },
    });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

