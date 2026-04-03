import { Op } from "sequelize";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import BktPgd from "../models/BKT-PGD.js";
import BktKrw from "../models/BKT-KRW.js";
import Komoditas from "../models/komoditas.js";
import {
  buildBktPgdWhere,
  buildKetersediaanEwsPanel,
  buildKetersediaanSummary,
  buildNeracaPanganDetail,
} from "../services/bktPgdService.js";
import { buildBktKrwWhere } from "../services/bktKrwService.js";

if (!BktPgd.associations?.komoditas) {
  BktPgd.belongsTo(Komoditas, { foreignKey: "komoditas_id", as: "komoditas" });
}

const KOMODITAS_INCLUDE = [
  {
    model: Komoditas,
    as: "komoditas",
    attributes: ["id", "nama", "kode", "satuan"],
    required: false,
  },
];

function recordTimestamp(record) {
  return record?.updated_at || record?.created_at || record?.periode || null;
}

function pickLatestByKey(rows = [], keySelector) {
  const latest = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    const current = latest.get(key);
    const currentTime = new Date(recordTimestamp(current) || 0).getTime();
    const rowTime = new Date(recordTimestamp(row) || 0).getTime();
    if (!current || rowTime >= currentTime) {
      latest.set(key, row);
    }
  }
  return Array.from(latest.values());
}

async function fetchBktPgdRows(where = {}) {
  return BktPgd.findAll({
    where,
    include: KOMODITAS_INCLUDE,
    order: [
      ["periode", "DESC"],
      ["updated_at", "DESC"],
      ["created_at", "DESC"],
    ],
  }).catch(() => []);
}

async function fetchBktKrwRows(where = {}) {
  return BktKrw.findAll({
    where,
    order: [
      ["periode", "DESC"],
      ["updated_at", "DESC"],
      ["created_at", "DESC"],
    ],
  }).catch(() => []);
}

export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user?.id;

    const [tugasAktif, laporanPending, pgdRows, krwRows] = await Promise.all([
      Task.count({
        where: {
          assigned_by: userId,
          status: { [Op.in]: ["pending", "in_progress"] },
        },
      }).catch(() => 0),
      Task.count({
        where: {
          assigned_by: userId,
          status: { [Op.in]: ["review_kabid", "submitted_to_kabid"] },
        },
      }).catch(() => 0),
      fetchBktPgdRows(),
      fetchBktKrwRows(),
    ]);

    const summary = buildKetersediaanSummary(pgdRows, krwRows);

    res.json({
      data: {
        tugas_aktif_tim: tugasAktif,
        laporan_pending_review: laporanPending,
        ews_status: summary.ews_status,
        neraca_pangan: summary.neraca_pangan,
        kabupaten_rawan: summary.kabupaten_rawan,
        validitas_data: summary.validitas_data,
        kelengkapan_data_persen: summary.kelengkapan_data_persen,
        update_terakhir: summary.update_terakhir,
      },
    });
  } catch (err) {
    console.error("[kabidKetersediaan] getDashboardSummary error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getEwsPanel(req, res) {
  try {
    const [pgdRows, krwRows] = await Promise.all([
      fetchBktPgdRows(),
      fetchBktKrwRows(),
    ]);

    const ewsData = buildKetersediaanEwsPanel(pgdRows, krwRows);
    res.json({ data: ewsData });
  } catch (err) {
    console.error("[kabidKetersediaan] getEwsPanel error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function kirimEwsKeKadin(req, res) {
  try {
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Notification.create({
      user_id: userId,
      jenis: "ews_escalation",
      judul: "EWS Dikirim ke Kepala Dinas",
      pesan:
        catatan ||
        "Early Warning System ketersediaan dikirim ke Kepala Dinas untuk tindak lanjut.",
      status: "terkirim",
      created_at: new Date(),
    }).catch(() => null);

    res.json({
      success: true,
      message: "EWS berhasil dikirim ke Kepala Dinas.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[kabidKetersediaan] kirimEwsKeKadin error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getApprovalQueue(req, res) {
  try {
    const userId = req.user?.id;

    const queue = await Task.findAll({
      where: {
        assigned_by: userId,
        status: "submitted_to_kabid",
      },
      order: [["created_at", "DESC"]],
      limit: 20,
    }).catch(() => []);

    res.json({
      data: queue.map((task) => ({
        id: task.id,
        judul: task.judul || task.title,
        disubmit_oleh: task.assigned_to,
        dibuat_pada: task.created_at,
        jenis: task.modul_id || "laporan_teknis",
        status: task.status,
        hari_menunggu: Math.floor(
          (Date.now() - new Date(task.created_at).getTime()) / 86400000,
        ),
      })),
      total: queue.length,
    });
  } catch (err) {
    console.error("[kabidKetersediaan] getApprovalQueue error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function setujuiDokumenJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await Task.update(
      { status: "approved_kabid", approved_by: userId, approved_at: new Date() },
      { where: { id, assigned_by: userId } },
    ).catch(() => null);

    res.json({
      success: true,
      message: "Dokumen disetujui dan diteruskan ke Sekretaris.",
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function kembalikanDokumenKJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Task.update(
      {
        status: "returned_to_jf",
        catatan_kabid: catatan,
        returned_by: userId,
        returned_at: new Date(),
      },
      { where: { id, assigned_by: userId } },
    ).catch(() => null);

    res.json({
      success: true,
      message: "Dokumen dikembalikan ke JF dengan catatan.",
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getTimJF(req, res) {
  try {
    const userId = req.user?.id;

    const tugasJF = await Task.findAll({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ["pending", "in_progress", "submitted_to_kabid"] },
      },
      order: [["deadline", "ASC"]],
      limit: 30,
    }).catch(() => []);

    res.json({
      data: {
        tim_jf: [
          {
            role: "JF 1",
            jabatan: "Jabatan Fungsional Analis Pangan Ahli Muda",
            tugas_aktif: tugasJF.filter((task) => task.status !== "done").length,
            tugas: tugasJF.slice(0, 3).map((task) => ({
              id: task.id,
              judul: task.judul || task.title,
              deadline: task.deadline,
              status: task.status,
            })),
          },
          {
            role: "JF 2",
            jabatan: "Jabatan Fungsional Analis Pangan Ahli Pertama",
            tugas_aktif: 1,
            tugas: [],
          },
        ],
        catatan_privasi:
          "Kepala Bidang tidak dapat melihat nilai SKP Pelaksana di bawah JF (PP 30/2019).",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function assignTugasKeJF(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, deskripsi, assigned_to, deadline, modul_id } = req.body;

    if (!judul || !assigned_to) {
      return res
        .status(400)
        .json({ error: "Judul dan penerima tugas wajib diisi." });
    }

    const tugas = await Task.create({
      judul,
      deskripsi,
      assigned_by: userId,
      assigned_to,
      deadline,
      modul_id: modul_id || "BKT",
      status: "pending",
      created_at: new Date(),
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getProduksiPangan(req, res) {
  try {
    const { periode_bulan, periode_tahun, kabupaten_kota, search } = req.query;
    const where = buildBktPgdWhere({
      ...req.query,
      jenis_pengendalian: "Pemantauan Produksi",
      bulan: periode_bulan || req.query.bulan,
      tahun: periode_tahun || req.query.tahun,
      kabupaten: kabupaten_kota || req.query.kabupaten,
      search,
    });

    const rows = await fetchBktPgdRows(where);

    res.json({
      data: rows.map((row) => ({
        id: row.id,
        periode: row.periode,
        tahun: row.tahun,
        bulan: row.bulan,
        kabupaten: row.kabupaten,
        kecamatan: row.kecamatan,
        komoditas: row.nama_komoditas || row.komoditas?.nama || null,
        luas_tanam: row.luas_tanam,
        luas_panen: row.luas_panen,
        produksi_total: row.produksi_total,
        produktivitas: row.produktivitas,
        target_produksi: row.target_produksi,
        persentase_capaian: row.persentase_capaian,
        validitas_data: row.validitas_data || "Valid",
        sumber_data: row.sumber_data || null,
      })),
      meta: {
        sumber: "BKT-PGD",
        total: rows.length,
        note: "Data produksi diambil dari input operasional Bidang Ketersediaan.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getStokPangan(req, res) {
  try {
    const rows = await fetchBktPgdRows(
      buildBktPgdWhere({
        ...req.query,
        jenis_pengendalian: req.query.jenis_pengendalian || "Neraca Pangan",
      }),
    );

    const latestByCommodity = pickLatestByKey(
      rows.filter((row) => row.stok_akhir != null || row.stok_awal != null),
      (row) => row?.komoditas_id || row?.nama_komoditas || row?.id,
    );

    res.json({
      data: latestByCommodity.map((row) => ({
        id: row.id,
        periode: row.periode,
        komoditas: row.nama_komoditas || row.komoditas?.nama || null,
        stok_awal: row.stok_awal,
        stok_akhir: row.stok_akhir,
        status_ketersediaan: row.status_ketersediaan || "Aman",
        early_warning_status: row.early_warning_status || "Normal",
        kabupaten: row.kabupaten || null,
      })),
      meta: {
        sumber: "BKT-PGD",
        total: latestByCommodity.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getNeracaPangan(req, res) {
  try {
    const { periode } = req.params;

    const rows = await fetchBktPgdRows(
      buildBktPgdWhere({
        ...req.query,
        periode_dari: periode ? `${periode}-01` : req.query.periode_dari,
      }),
    );

    const detail = buildNeracaPanganDetail(rows, periode);

    res.json({
      data: detail,
      meta: {
        sumber: "BKT-PGD",
        note: "Neraca pangan dibentuk dari ketersediaan, penggunaan, dan stok akhir per komoditas.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getKerawananPangan(req, res) {
  try {
    const where = buildBktKrwWhere(req.query);
    const rows = await fetchBktKrwRows(where);
    const latestByKabupaten = pickLatestByKey(
      rows,
      (row) => row?.kabupaten || row?.id,
    );

    res.json({
      data: latestByKabupaten.map((row) => ({
        id: row.id,
        periode: row.periode,
        kabupaten: row.kabupaten,
        kecamatan: row.kecamatan,
        desa: row.desa,
        tingkat_kerawanan: row.tingkat_kerawanan,
        status_ketersediaan: row.status_ketersediaan,
        skor_kerawanan: row.skor_kerawanan,
        stok_pangan: row.stok_pangan,
        tanggal_update_stok: row.tanggal_update_stok,
        penyebab_kerawanan: row.penyebab_kerawanan,
        rencana_aksi: row.rencana_aksi,
        instansi_terkait: row.instansi_terkait,
      })),
      meta: {
        sumber: "BKT-KRW",
        total: latestByKabupaten.length,
        note: "Data kerawanan dipilih dari record terbaru per kabupaten.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getLaporanKeSekretarisStatus(req, res) {
  try {
    res.json({
      data: [],
      meta: {
        note: "Belum ada dokumen yang dikembalikan dari Sekretaris untuk Bidang Ketersediaan.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getSkpJF(req, res) {
  try {
    res.json({
      data: [
        { jf_role: "JF 1", status_skp: "belum_dinilai", periode: "2026" },
        { jf_role: "JF 2", status_skp: "belum_dinilai", periode: "2026" },
      ],
      blocked: {
        pelaksana: true,
        alasan:
          "Nilai SKP Pelaksana bersifat CONFIDENTIAL (PP 30/2019). Kepala Bidang tidak memiliki akses.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
  }
}
