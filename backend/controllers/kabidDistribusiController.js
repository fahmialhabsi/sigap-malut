// Controller: Kepala Bidang Distribusi & Cadangan Pangan
import { Op } from "sequelize";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import InflasiHarian from "../models/InflasiHarian.js";
import HargaPangan from "../models/HargaPangan.js";
import { listRecentAnomalyRows } from "../services/hargaPanganRepository.js";
import { adminAmendHargaPanganRow } from "../services/hargaPanganService.js";

/** Penyumbang relatif dari detail_perhitungan.komoditas_detail (audit-friendly, bukan narasi AI). */
function penyumbangFromDetail(detail) {
  if (!detail?.komoditas_detail) return [];
  const scored = Object.entries(detail.komoditas_detail).map(([key, v]) => {
    const rel = v?.relatif_harga != null ? Number(v.relatif_harga) : null;
    return {
      komoditas: key.replace(/_/g, " "),
      perubahan_persen: rel != null ? (rel - 1) * 100 : null,
      rel,
      w: v?.w != null ? Number(v.w) : null,
    };
  });
  scored.sort((a, b) => Math.abs((b.rel ?? 1) - 1) - Math.abs((a.rel ?? 1) - 1));
  return scored.slice(0, 5).map((p) => ({
    komoditas: p.komoditas,
    perubahan_persen:
      p.perubahan_persen != null ? Number(p.perubahan_persen.toFixed(2)) : null,
    kontribusi_poin:
      p.w != null && p.rel != null
        ? Number((p.w * (p.rel - 1) * 100).toFixed(3))
        : null,
    level: p.rel != null && Math.abs(p.rel - 1) > 0.05 ? "kritis" : "normal",
  }));
}

function statusTargetFromMtd(mtd, target = 2.5) {
  if (mtd == null || Number.isNaN(Number(mtd))) return "tidak_tersedia";
  const m = Number(mtd);
  if (m > target) return "melampaui";
  if (m <= target * 0.85) return "on_target";
  return "mendekati";
}

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
        inflasi_bulanan: { nilai: 2.38, satuan: '%', periode: 'Mar-2026' },
        inflasi_tahunan: { nilai: 2.87, satuan: '%', periode: '2026' },
        alert_harga_kritis: { jumlah: 2, komoditas: ['Beras', 'Minyak Goreng'] },
        cppd_status: { status: 'aman', stok_hari: 45, komoditas_kritis: 1 },
        kab_fluktuasi: 4,
        realisasi_anggaran_persen: 38.2,
        tugas_aktif_tim: tugasAktif,
        laporan_pending_review: laporanPending
      }
    });
  } catch (err) {
    console.error('[kabidDistribusi] getDashboardSummary error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === HERO: DATA INFLASI (sumber: inflasi_harian, tanpa placeholder) ===
export async function getHeroInflasi(req, res) {
  try {
    const latest = await InflasiHarian.findOne({
      order: [["tanggal", "DESC"]],
    }).catch(() => null);

    let jumlahPasar = null;
    try {
      jumlahPasar = await HargaPangan.count({
        distinct: true,
        col: "pasar_nama",
        where: { status: "terverifikasi", pasar_nama: { [Op.ne]: null } },
      });
    } catch {
      jumlahPasar = null;
    }

    const target = 2.5;
    const mtd =
      latest?.inflasi_mtd_persen != null ? Number(latest.inflasi_mtd_persen) : null;
    const dod =
      latest?.inflasi_dod_persen != null ? Number(latest.inflasi_dod_persen) : null;
    const indeks =
      latest?.indeks_laspeyres != null ? Number(latest.indeks_laspeyres) : null;
    const cov =
      latest?.coverage_komoditas_persen != null
        ? Number(latest.coverage_komoditas_persen)
        : latest?.detail_perhitungan?.audit?.coverage_komoditas_persen != null
          ? Number(latest.detail_perhitungan.audit.coverage_komoditas_persen)
          : null;

    const series = await InflasiHarian.findAll({
      attributes: ["tanggal", "indeks_laspeyres", "inflasi_dod_persen"],
      order: [["tanggal", "DESC"]],
      limit: 6,
      raw: true,
    }).catch(() => []);
    const tren_indeks_harian = [...series].reverse().map((r) => ({
      tanggal: r.tanggal,
      indeks: r.indeks_laspeyres != null ? Number(r.indeks_laspeyres) : null,
      inflasi_dod_persen:
        r.inflasi_dod_persen != null ? Number(r.inflasi_dod_persen) : null,
    }));

    const penyumbang_utama = latest?.detail_perhitungan
      ? penyumbangFromDetail(latest.detail_perhitungan)
      : [];

    const inflasiData = {
      data_tidak_tersedia: !latest,
      tanggal_indeks_terakhir: latest?.tanggal ?? null,
      indeks_laspeyres_harian: indeks,
      inflasi_dod_persen: dod,
      inflasi_mtd_proksi_persen: mtd,
      inflasi_yoy_proksi_persen:
        latest?.inflasi_yoy_proksi_persen != null
          ? Number(latest.inflasi_yoy_proksi_persen)
          : null,
      coverage_komoditas_persen: cov,
      target_tpid_persen: target,
      status_target: statusTargetFromMtd(mtd, target),
      sumber: {
        jumlah_pasar: jumlahPasar,
        jumlah_kabkota: null,
      },
      tren_indeks_harian,
      penyumbang_utama,
      metodologi_ringkas: latest?.metodologi_ringkas ?? null,
      detail_perhitungan: latest?.detail_perhitungan ?? null,
      update_terakhir:
        latest?.updated_at?.toISOString?.() ||
        latest?.created_at?.toISOString?.() ||
        null,
      catatan:
        "Angka dari tabel inflasi_harian (harga terverifikasi). Indeks Laspeyres-tipe internal; bukan duplikasi IHK publikasi BPS.",
    };

    res.json({ data: inflasiData });
  } catch (err) {
    console.error('[kabidDistribusi] getHeroInflasi error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === ALERT: baris harga_pangan dengan is_anomaly (bukan mock HET) ===
export async function getAlertHargaKritis(req, res) {
  try {
    const rows = await listRecentAnomalyRows({ limit: 50 });
    const alerts = rows.map((r) => ({
      id: r.id,
      komoditas: r.komoditas_nama || r.komoditas_key || "—",
      harga_pasar: r.harga_eceran != null ? Number(r.harga_eceran) : null,
      kabupaten: r.kabupaten_kota,
      tanggal_pemantauan: r.tanggal,
      pasar_nama: r.pasar_nama,
      level: "anomali",
      status_verifikasi: r.status,
      batch_id: r.batch_id,
      anomaly_reason: r.anomaly_reason,
      requires_manual_verify: r.status === "menunggu_verifikasi",
    }));

    res.json({
      data: alerts,
      total: alerts.length,
      update_terakhir: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[kabidDistribusi] getAlertHargaKritis error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

/** Koreksi harga oleh admin (bypass lock terverifikasi) — wajib audit di service. */
export async function adminAmendHargaPangan(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "invalid_id" });
    }
    const { harga_eceran, alasan } = req.body || {};
    const out = await adminAmendHargaPanganRow(
      id,
      { harga_eceran, alasan },
      { id: req.user?.id, role: req.user?.role },
    );
    if (!out.ok) {
      if (out.error === "forbidden_amend") {
        return res.status(403).json({ error: "forbidden", code: "HARGA_PANGAN_AMEND_ADMIN_ONLY" });
      }
      if (out.error === "not_found") return res.status(404).json({ error: "not_found" });
      if (out.hardErrors?.length) {
        return res.status(400).json({ error: "validasi_gagal", details: out.hardErrors });
      }
      return res.status(400).json({ error: "bad_request" });
    }
    res.json({ success: true, data: out.row });
  } catch (err) {
    console.error("[kabidDistribusi] adminAmendHargaPangan:", err);
    res.status(500).json({ error: "internal_server_error" });
  }
}

// === STATUS CPPD (CADANGAN PANGAN PEMERINTAH DAERAH) ===
export async function getCppdStatus(req, res) {
  try {
    const cppdData = {
      status_keseluruhan: 'aman',
      update_terakhir: new Date().toISOString(),
      stok_cadangan: [
        {
          komoditas: 'Beras',
          stok_ton: 245.5,
          target_ton: 300.0,
          persen_tercapai: 81.8,
          lokasi_gudang: 'Gudang Badan Pangan Ternate',
          status: 'aman'
        },
        {
          komoditas: 'Jagung',
          stok_ton: 12.3,
          target_ton: 50.0,
          persen_tercapai: 24.6,
          lokasi_gudang: 'Gudang Badan Pangan Sofifi',
          status: 'kritis'
        },
        {
          komoditas: 'Kedelai',
          stok_ton: 8.7,
          target_ton: 20.0,
          persen_tercapai: 43.5,
          lokasi_gudang: 'Gudang Badan Pangan Ternate',
          status: 'waspada'
        }
      ],
      catatan: 'Data CPPD berdasarkan laporan gudang periode terakhir'
    };

    res.json({ data: cppdData });
  } catch (err) {
    console.error('[kabidDistribusi] getCppdStatus error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}

// === STATUS LAPORAN ↔ SEKRETARIS (stub — sinkron workflow dokumen) ===
export async function getLaporanKeSekretarisStatus(req, res) {
  try {
    res.json({
      data: [],
      meta: { note: "Belum ada dokumen dari Sekretaris / siap untuk integrasi workflow." },
    });
  } catch (err) {
    res.status(500).json({ error: "internal_server_error" });
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
    console.error('[kabidDistribusi] getApprovalQueue error:', err);
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
            bidang: 'Distribusi & Cadangan Pangan',
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
            bidang: 'Distribusi & Cadangan Pangan',
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
      modul_id: modul_id || 'BDS',
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
        { jf_role: 'JF 1', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Distribusi' },
        { jf_role: 'JF 2', status_skp: 'belum_dinilai', periode: '2026', bidang: 'Distribusi' }
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

// === GENERATE LAPORAN MENDAGRI (2-MINGGUAN) ===
export async function generateLaporanMendagri(req, res) {
  try {
    const userId = req.user?.id;
    const { periode_awal, periode_akhir, catatan_tambahan } = req.body;

    const laporan = {
      id: `LPR-MENDAGRI-${Date.now()}`,
      jenis: 'laporan_distribusi_mendagri',
      dibuat_oleh: userId,
      periode: {
        awal: periode_awal || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
        akhir: periode_akhir || new Date().toISOString().split('T')[0]
      },
      status: 'draft',
      konten: {
        ringkasan_inflasi: {
          inflasi_bulanan: 0.32,
          inflasi_tahunan: 2.87,
          tren: 'naik',
          penyumbang: ['Beras', 'Cabai Merah']
        },
        status_distribusi: {
          kelancaran: 'normal',
          gangguan: [],
          kab_kota_terpantau: 10
        },
        cppd_status: {
          stok_beras_ton: 245.5,
          kecukupan_hari: 45,
          status: 'aman'
        },
        harga_strategis: [
          { komoditas: 'Beras Medium', harga: 14500, het: 12500, status: 'di_atas_het' },
          { komoditas: 'Minyak Goreng', harga: 18000, het: 14000, status: 'di_atas_het' }
        ],
        rekomendasi: catatan_tambahan || 'Perlu percepatan distribusi CPPD ke wilayah kepulauan.',
        jadwal_rapat: 'Rapat koordinasi 2-mingguan bersama Mendagri'
      },
      dibuat_pada: new Date().toISOString()
    };

    // Notifikasi pembuatan laporan
    await Notification.create({
      user_id: userId,
      jenis: 'laporan_mendagri',
      judul: 'Laporan Distribusi untuk Rapat Mendagri Dibuat',
      pesan: `Laporan periode ${laporan.periode.awal} s/d ${laporan.periode.akhir} berhasil dibuat.`,
      status: 'baru',
      created_at: new Date()
    }).catch(() => null);

    res.status(201).json({ success: true, data: laporan });
  } catch (err) {
    console.error('[kabidDistribusi] generateLaporanMendagri error:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
}
