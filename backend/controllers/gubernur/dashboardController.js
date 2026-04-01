import { Op } from "sequelize";
import {
  InstruksiGubernur,
  PengajuanKeGubernur,
  NotifikasiGubernur,
} from "../../models/index.js";

function ymd(d = new Date()) {
  return new Date(d).toISOString().slice(0, 10);
}

export async function getSummary(req, res) {
  try {
    const gubernurId = req.user?.id;

    const [perintahAktif, menungguApproval, alertKritis, slaPct] =
      await Promise.all([
        InstruksiGubernur.count({
          where: {
            status: { [Op.in]: ["diterbitkan", "dibaca", "diproses", "terlambat"] },
          },
        }),
        PengajuanKeGubernur.count({
          where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
        }),
        NotifikasiGubernur.count({
          where: {
            user_id: gubernurId,
            jenis: { [Op.in]: ["alert_kritis", "deadline_dekat"] },
            sudah_dibaca: false,
          },
        }),
        Promise.resolve(92), // MVP: SLA agregat
      ]);

    return res.json({
      success: true,
      data: {
        perintah_aktif: perintahAktif,
        menunggu_approval: menungguApproval,
        alert_kritis: alertKritis,
        sla_persen: slaPct,
        tanggal: ymd(),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Gagal ambil summary", error: err.message });
  }
}

export async function getPetaPangan(req, res) {
  try {
    // MVP: dataset minimal agar peta bisa render. Nanti diganti query tabel riil.
    const rows = [
      { nama: "Ternate", lat: 0.786, lng: 127.379, stok: 85, kerawanan: "rendah", distribusi: 120 },
      { nama: "Tidore Kepulauan", lat: 0.674, lng: 127.421, stok: 72, kerawanan: "sedang", distribusi: 95 },
      { nama: "Halmahera Utara", lat: 1.54, lng: 127.99, stok: 58, kerawanan: "sedang", distribusi: 60 },
      { nama: "Halmahera Selatan", lat: -0.45, lng: 127.98, stok: 41, kerawanan: "tinggi", distribusi: 45 },
      { nama: "Halmahera Timur", lat: 0.76, lng: 128.39, stok: 35, kerawanan: "tinggi", distribusi: 30 },
      { nama: "Morotai", lat: 2.32, lng: 128.47, stok: 68, kerawanan: "rendah", distribusi: 70 },
    ];
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Gagal ambil data peta", error: err.message });
  }
}

export async function getBriefingHarian(req, res) {
  try {
    return res.json({
      success: true,
      data: {
        tanggal: ymd(),
        ringkas:
          "Briefing harian (MVP): ringkasan kondisi pangan akan diisi otomatis via scheduler.",
        highlight: [
          "Pantau perintah aktif & pengajuan strategis.",
          "Fokus alert kerawanan tinggi dan deadline instruksi.",
        ],
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Gagal ambil briefing", error: err.message });
  }
}

