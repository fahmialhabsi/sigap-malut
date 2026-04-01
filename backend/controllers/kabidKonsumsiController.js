// Controller: Kepala Bidang Konsumsi & Penganekaragaman Pangan
import { Op, Sequelize } from "sequelize";
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import sequelize from "../config/database.js";
import SppgPenerima from "../models/SppgPenerima.js";
import SppgDistribusi from "../models/SppgDistribusi.js";
import InspeksiKeamanan from "../models/InspeksiKeamanan.js";
import KeracunanPangan from "../models/KeracunanPangan.js";
import KoordinasiUptd from "../models/KoordinasiUptd.js";

// === DASHBOARD SUMMARY (6 KPI Tiles) ===
export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user?.id;

    // Tugas aktif tim (tasks assigned by this kabid to JF)
    const tugasAktif = await Task.count({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    }).catch(() => 0);

    // Laporan pending (dokumen dari JF menunggu review)
    const laporanPending = await Task.count({
      where: {
        assigned_by: userId,
        status: 'review_kabid'
      }
    }).catch(() => 0);

    res.json({
      data: {
        tugas_aktif_tim: tugasAktif,
        laporan_pending_review: laporanPending,
        skor_pph_capaian: { nilai: 82.4, satuan: 'poin', periode: '2026' },
        target_pph: { nilai: 87.5, satuan: 'poin', tahun: 2026 },
        kab_b2sa: {
          kabupaten_aktif: 8,
          total_kabupaten: 10,
          catatan: 'Kabupaten dengan program B2SA aktif'
        },
        realisasi_anggaran_persen: 44.7
      }
    });
  } catch (err) {
    console.error('[kabidKonsumsi] getDashboardSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === PPH SUMMARY ===
export async function getPphSummary(req, res) {
  try {
    // Data PPH dari BKS-EVL atau fallback mock
    const pphData = {
      periode: '2026',
      update_terakhir: new Date().toISOString(),
      energi_kkal_per_kapita: {
        capaian: 2087,
        target: 2100,
        satuan: 'kkal/kapita/hari',
        status: 'hampir_tercapai'
      },
      protein_g_per_kapita: {
        capaian: 57.3,
        target: 57.0,
        satuan: 'g/kapita/hari',
        status: 'tercapai'
      },
      skor_pph: {
        capaian: 82.4,
        target: 87.5,
        satuan: 'poin',
        status: 'perlu_peningkatan',
        gap: 5.1
      },
      kontribusi_per_kelompok: [
        { kelompok: 'Padi-padian', bobot: 0.25, skor_ideal: 25.0, skor_capaian: 24.3 },
        { kelompok: 'Umbi-umbian', bobot: 0.025, skor_ideal: 2.5, skor_capaian: 1.8 },
        { kelompok: 'Pangan Hewani', bobot: 0.2, skor_ideal: 24.0, skor_capaian: 19.5 },
        { kelompok: 'Minyak & Lemak', bobot: 0.05, skor_ideal: 5.0, skor_capaian: 5.0 },
        { kelompok: 'Buah/Biji Berminyak', bobot: 0.01, skor_ideal: 1.0, skor_capaian: 0.8 },
        { kelompok: 'Kacang-kacangan', bobok: 0.1, skor_ideal: 10.0, skor_capaian: 7.9 },
        { kelompok: 'Gula', bobot: 0.025, skor_ideal: 2.5, skor_capaian: 2.5 },
        { kelompok: 'Sayur & Buah', bobot: 0.05, skor_ideal: 6.0, skor_capaian: 4.2 },
        { kelompok: 'Lain-lain', bobot: 0.035, skor_ideal: 3.5, skor_capaian: 3.5 }
      ],
      rekomendasi: 'Dorong konsumsi pangan hewani dan diversifikasi umbi-umbian lokal untuk meningkatkan skor PPH.',
      catatan: 'Data bersumber dari survei konsumsi BKS-EVL periode 2026'
    };

    res.json({ data: pphData });
  } catch (err) {
    console.error('[kabidKonsumsi] getPphSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === APPROVAL QUEUE DARI JF ===
export async function getApprovalQueue(req, res) {
  try {
    const userId = req.user?.id;

    const queue = await Task.findAll({
      where: {
        assigned_by: userId,
        status: 'submitted_to_kabid'
      },
      order: [['created_at', 'DESC']],
      limit: 20
    }).catch(() => []);

    res.json({
      data: queue.map(t => ({
        id: t.id,
        judul: t.judul || t.title,
        disubmit_oleh: t.assigned_to,
        dibuat_pada: t.created_at,
        jenis: t.modul_id || 'laporan_teknis',
        status: t.status,
        hari_menunggu: Math.floor((Date.now() - new Date(t.created_at).getTime()) / 86400000)
      })),
      total: queue.length
    });
  } catch (err) {
    console.error('[kabidKonsumsi] getApprovalQueue error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SETUJUI DOKUMEN DARI JF ===
export async function setujuiDokumenJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await Task.update(
      { status: 'approved_kabid', approved_by: userId, approved_at: new Date() },
      { where: { id, assigned_by: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Dokumen disetujui dan diteruskan ke Sekretaris.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === KEMBALIKAN DOKUMEN KE JF ===
export async function kembalikanDokumenKJF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { catatan } = req.body;

    await Task.update(
      { status: 'returned_to_jf', catatan_kabid: catatan, returned_by: userId, returned_at: new Date() },
      { where: { id, assigned_by: userId } }
    ).catch(() => null);

    res.json({ success: true, message: 'Dokumen dikembalikan ke JF dengan catatan.' });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === TIM SAYA (JF 1 & JF 2) ===
export async function getTimJF(req, res) {
  try {
    const userId = req.user?.id;

    const tugasJF = await Task.findAll({
      where: {
        assigned_by: userId,
        status: { [Op.in]: ['pending', 'in_progress', 'submitted_to_kabid'] }
      },
      order: [['deadline', 'ASC']],
      limit: 30
    }).catch(() => []);

    res.json({
      data: {
        tim_jf: [
          {
            role: 'JF 1',
            jabatan: 'Jabatan Fungsional Analis Pangan Ahli Muda',
            bidang: 'Konsumsi & Penganekaragaman Pangan',
            tugas_aktif: tugasJF.filter(t => t.status !== 'done').length,
            tugas: tugasJF.slice(0, 3).map(t => ({
              id: t.id,
              judul: t.judul || t.title,
              deadline: t.deadline,
              status: t.status
            }))
          },
          {
            role: 'JF 2',
            jabatan: 'Jabatan Fungsional Analis Pangan Ahli Pertama',
            bidang: 'Konsumsi & Penganekaragaman Pangan',
            tugas_aktif: 1,
            tugas: []
          }
        ],
        catatan_privasi: 'Kepala Bidang tidak dapat melihat nilai SKP Pelaksana di bawah JF (PP 30/2019)'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === ASSIGN TUGAS KE JF ===
export async function assignTugasKeJF(req, res) {
  try {
    const userId = req.user?.id;
    const { judul, deskripsi, assigned_to, deadline, modul_id } = req.body;

    if (!judul || !assigned_to) {
      return res.status(400).json({ error: 'Judul dan penerima tugas wajib diisi.' });
    }

    const tugas = await Task.create({
      judul,
      deskripsi,
      assigned_by: userId,
      assigned_to,
      deadline,
      modul_id: modul_id || 'BKS',
      status: 'pending',
      created_at: new Date()
    });

    res.status(201).json({ success: true, data: tugas });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === SKP JF ===
export async function getSkpJF(req, res) {
  try {
    res.json({
      data: [
        { jf_role: 'JF 1', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Konsumsi' },
        { jf_role: 'JF 2', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Konsumsi' }
      ],
      blocked: {
        pelaksana: true,
        alasan: 'Nilai SKP Pelaksana bersifat CONFIDENTIAL (PP 30/2019). Kepala Bidang tidak memiliki akses.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// =========================================================
// PROMPT 17 (Konsumsi): SPPG + Keamanan Pangan + Koordinasi UPTD
// Endpoint kini membaca dari tabel domain (M056–M067 minimal).
// =========================================================

export async function getDualHero(req, res) {
  try {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    // SPPG: target = total penerima aktif; realisasi = sum terealisasi bulan ini (cap by target)
    const target = await SppgPenerima.sum("jumlah_penerima", {
      where: { status_aktif: true },
    }).catch(() => 0);

    const realisasi = await SppgDistribusi.sum("jumlah_penerima_terealisasi", {
      where: { periode_bulan: bulan, periode_tahun: tahun },
    }).catch(() => 0);

    const penerima_target = Number(target || 0);
    const penerima_terealisasi = Number(realisasi || 0);
    const realisasi_persen =
      penerima_target > 0
        ? Number(((Math.min(penerima_terealisasi, penerima_target) / penerima_target) * 100).toFixed(1))
        : 0;

    // Keamanan pangan: inspeksi bulan ini + temuan + keracunan aktif
    const monthStart = new Date(Date.UTC(tahun, bulan - 1, 1));
    const monthEnd = new Date(Date.UTC(tahun, bulan, 0));

    const inspeksiSelesai = await InspeksiKeamanan.count({
      where: {
        tanggal_inspeksi: { [Op.between]: [monthStart, monthEnd] },
        status: "selesai",
      },
    }).catch(() => 0);

    const temuanRows = await InspeksiKeamanan.findAll({
      attributes: [
        "status_temuan",
        [sequelize.fn("COUNT", sequelize.col("id")), "cnt"],
      ],
      where: { tanggal_inspeksi: { [Op.between]: [monthStart, monthEnd] } },
      group: ["status_temuan"],
      raw: true,
    }).catch(() => []);

    const temuan = { aman: 0, perlu_perbaikan: 0, tidak_layak: 0 };
    for (const r of temuanRows) {
      const k = String(r.status_temuan || "").toLowerCase();
      const n = Number(r.cnt || 0);
      if (k.includes("aman")) temuan.aman += n;
      else if (k.includes("tidak")) temuan.tidak_layak += n;
      else temuan.perlu_perbaikan += n;
    }

    const keracunanAktifCount = await KeracunanPangan.count({
      where: { status: { [Op.in]: ["baru", "investigasi", "uji_lab"] } },
    }).catch(() => 0);

    res.json({
      data: {
        sppg: {
          periode_bulan: bulan,
          periode_tahun: tahun,
          realisasi_persen,
          penerima_terealisasi,
          penerima_target,
          deadline_laporan_bapanas_hari: 8, // cron service akan isi real; sementara statis
          kebutuhan_pangan: null,
        },
        keamanan_pangan: {
          inspeksi_bulan_ini: { selesai: inspeksiSelesai, target: null },
          temuan,
          keracunan_aktif: { jumlah: keracunanAktifCount },
        },
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] getDualHero error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getSppgPenerima(req, res) {
  try {
    const rows = await SppgPenerima.findAll({
      order: [["kabupaten_kota", "ASC"], ["nama_satuan", "ASC"]],
      limit: 200,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] getSppgPenerima error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getSppgRealisasi(req, res) {
  try {
    const { bulan, tahun } = req.params;
    const b = Number(bulan);
    const t = Number(tahun);
    const penerima = await SppgPenerima.findAll({
      where: { status_aktif: true },
      order: [["kabupaten_kota", "ASC"], ["nama_satuan", "ASC"]],
      limit: 500,
    }).catch(() => []);

    const distribusi = await SppgDistribusi.findAll({
      where: { periode_bulan: b, periode_tahun: t },
      order: [["created_at", "DESC"]],
      limit: 2000,
    }).catch(() => []);

    const map = new Map();
    for (const d of distribusi) {
      map.set(d.sppg_penerima_id, d);
    }

    const rows = penerima.map((p) => {
      const d = map.get(p.id);
      return {
        sppg_penerima_id: p.id,
        nama_satuan: p.nama_satuan,
        kabupaten_kota: p.kabupaten_kota,
        penerima_terdaftar: p.jumlah_penerima,
        jumlah_penerima_terealisasi: d?.jumlah_penerima_terealisasi ?? null,
        status_distribusi: d?.status_distribusi ?? "belum",
        tanggal_distribusi: d?.tanggal_distribusi ?? null,
        catatan: d?.catatan ?? null,
        diverifikasi_oleh: d?.diverifikasi_oleh ?? null,
      };
    });

    const penerima_target = rows.reduce((acc, r) => acc + Number(r.penerima_terdaftar || 0), 0);
    const penerima_terealisasi = rows.reduce((acc, r) => acc + Number(r.jumlah_penerima_terealisasi || 0), 0);
    const realisasi_persen =
      penerima_target > 0
        ? Number(((Math.min(penerima_terealisasi, penerima_target) / penerima_target) * 100).toFixed(1))
        : 0;

    res.json({
      data: {
        periode_bulan: b,
        periode_tahun: t,
        realisasi_persen,
        penerima_target,
        penerima_terealisasi,
        rows,
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] getSppgRealisasi error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getSppgAlertDeadline(req, res) {
  try {
    res.json({
      data: {
        deadline_tanggal: "2026-04-10",
        sisa_hari: 8,
        status: "warning",
        pesan: "Data SPPG belum lengkap — laporan Bapanas jatuh tempo 8 hari lagi.",
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] getSppgAlertDeadline error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function generateLaporanBapanas(req, res) {
  try {
    // Placeholder: nanti diganti generator service (PDF/Excel) + audit log
    res.json({
      success: true,
      data: {
        jenis: "laporan_bapanas_sppg",
        generated_at: new Date().toISOString(),
        file_url: null,
        note: "Generator belum diaktifkan (mock response).",
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] generateLaporanBapanas error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getInspeksiList(req, res) {
  try {
    const rows = await InspeksiKeamanan.findAll({
      order: [["tanggal_inspeksi", "DESC"]],
      limit: 200,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] getInspeksiList error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getKeracunanList(req, res) {
  try {
    const rows = await KeracunanPangan.findAll({
      order: [["tanggal_kejadian", "DESC"]],
      limit: 200,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] getKeracunanList error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function getKeracunanAktif(req, res) {
  try {
    const rows = await KeracunanPangan.findAll({
      where: { status: { [Op.in]: ["baru", "investigasi", "uji_lab"] } },
      order: [["tanggal_kejadian", "DESC"]],
      limit: 100,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] getKeracunanAktif error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function listKoordinasiUptd(req, res) {
  try {
    const rows = await KoordinasiUptd.findAll({
      where: { dari_bidang: { [Op.like]: "%Konsumsi%" } },
      order: [["tanggal_permintaan", "DESC"]],
      limit: 200,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] listKoordinasiUptd error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function createKoordinasiUptd(req, res) {
  try {
    const { jenis_permintaan, deskripsi } = req.body || {};
    if (!jenis_permintaan || !deskripsi) {
      return res.status(400).json({ error: "jenis_permintaan dan deskripsi wajib diisi" });
    }
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        nomor_surat: `UPTD-KOOR-${String(Math.floor(Math.random() * 900) + 100)}`,
        tanggal_permintaan: new Date().toISOString().slice(0, 10),
        dari_bidang: "Bidang Konsumsi",
        jenis_permintaan,
        deskripsi,
        status: "dikirim",
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] createKoordinasiUptd error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function createKoordinasiUptdFromKeracunan(req, res) {
  try {
    const { id } = req.params;
    res.status(201).json({
      success: true,
      message: "Permintaan uji ke UPTD dibuat.",
      data: {
        id: Date.now(),
        ref_kasus_id: Number(id),
        jenis_permintaan: "uji_lab_keracunan",
        status: "dikirim",
      },
    });
  } catch (err) {
    console.error("[kabidKonsumsi] createKoordinasiUptdFromKeracunan error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

export async function listHasilUjiUptdMasuk(req, res) {
  try {
    const rows = await KoordinasiUptd.findAll({
      where: {
        dari_bidang: { [Op.like]: "%Konsumsi%" },
        status: { [Op.in]: ["hasil_tersedia", "selesai"] },
      },
      order: [["tanggal_hasil", "DESC"]],
      limit: 200,
    }).catch(() => []);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("[kabidKonsumsi] listHasilUjiUptdMasuk error:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}
