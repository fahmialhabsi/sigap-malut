/**
 * Pelaksana SPJ Controller
 *
 * Menangani SPJ Kondisi A (Mandiri) dan Kondisi B (Delegasi) dari sisi Pelaksana/PPTK.
 *
 * Alur Kondisi A:
 *   draft → diajukan_ke_bendahara
 *
 * Alur Kondisi B:
 *   draft_delegasi → menunggu_konfirmasi_pejabat (setelah finalisasi draft)
 *   dikonfirmasi_pejabat → diajukan_ke_bendahara (otomatis atau PPTK trigger)
 *   ditolak_pejabat → kembali ke draft_delegasi (PPTK perbaiki)
 */
import { Op } from "sequelize";
import Spj from "../../models/Spj.js";
import User from "../../models/User.js";
import { gateOperationalUpdate } from "../../services/executionThreadGate.js";

// Hari kerja + 3 (deadline konfirmasi pejabat)
function tambahHariKerja(tanggal, n) {
  const d = new Date(tanggal);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString().slice(0, 10);
}

function ensureOwner(row, userId) {
  return row && Number(row.dibuat_oleh) === Number(userId);
}

// ── LIST SPJ SAYA (mandiri + delegasi yang saya buat) ───────────────────────
export async function listSpjSaya(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const rows = await Spj.findAll({
      where: { dibuat_oleh: userId },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ saya", error: err.message });
  }
}

// ── DETAIL SPJ ──────────────────────────────────────────────────────────────
export async function getSpjDetail(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    // Enrich dengan nama pejabat jika kondisi B
    let pejabatInfo = null;
    if (row.atas_nama_pejabat_id) {
      pejabatInfo = await User.findByPk(row.atas_nama_pejabat_id, {
        attributes: ["id", "nama_lengkap", "jabatan", "unit_kerja"],
      }).catch(() => null);
    }
    return res.json({ success: true, data: { ...row.toJSON(), pejabat: pejabatInfo } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SPJ", error: err.message });
  }
}

// ── BUAT SPJ KONDISI A (MANDIRI) ────────────────────────────────────────────
// SPJ adalah dokumen keuangan mandiri — tidak wajib terikat execution thread.
// execution_thread_id & task_id bersifat opsional (untuk traceabilitas).
export async function createSpj(req, res) {
  try {
    const userId = req.user?.id;
    const body = req.body || {};

    const row = await Spj.create({
      nomor_spj: body.nomor_spj || null,
      jenis_kondisi: "mandiri",
      jenis_belanja: body.jenis_belanja,
      sub_kegiatan_kode: body.sub_kegiatan_kode || "SEKRETARIAT",
      kode_rekening: body.kode_rekening || "5.2.2.11.01",
      nominal: body.nominal || 0,
      keterangan: body.keterangan || null,
      uraian_kegiatan: body.uraian_kegiatan || null,
      dibuat_oleh: userId,
      pptk_id: userId, // untuk mandiri, PPTK adalah dirinya sendiri
      tanggal_kegiatan: body.tanggal_kegiatan || new Date(),
      lampiran_url: body.lampiran_url || null,
      unit_kerja_asal: req.user?.unit_kerja || null,
      status: "draft",
      revisi_ke: 0,
      jenis_bendahara: "pengeluaran",
      execution_thread_id: body.execution_thread_id ?? null,
      task_id: body.task_id != null && Number.isFinite(Number(body.task_id)) ? Number(body.task_id) : null,
    });

    return res.json({ success: true, message: "SPJ mandiri (draft) dibuat", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal membuat SPJ", error: err.message });
  }
}

// ── BUAT SPJ KONDISI B (DELEGASI — PPTK BUAT ATAS NAMA PEJABAT) ─────────────
// spjSelfGuard sudah mengisi: jenis_kondisi, pptk_id, atas_nama_pejabat_id, status: draft_delegasi
export async function createSpjDelegasi(req, res) {
  try {
    const body = req.body || {};

    // Validasi: pejabat yang dituju harus ada
    const pejabat = await User.findByPk(body.atas_nama_pejabat_id);
    if (!pejabat) {
      return res.status(404).json({ success: false, message: "Pejabat yang dituju tidak ditemukan" });
    }

    const row = await Spj.create({
      nomor_spj: body.nomor_spj || null,
      jenis_kondisi: "delegasi",
      atas_nama_pejabat_id: body.atas_nama_pejabat_id,
      pptk_id: body.pptk_id || req.user?.id,
      dibuat_oleh: req.user?.id,
      jenis_belanja: body.jenis_belanja,
      sub_kegiatan_kode: body.sub_kegiatan_kode || "SEKRETARIAT",
      kode_rekening: body.kode_rekening || "5.2.2.11.01",
      nominal: body.nominal || 0,
      keterangan: body.keterangan || null,
      uraian_kegiatan: body.uraian_kegiatan || null,
      tanggal_kegiatan: body.tanggal_kegiatan || new Date(),
      lampiran_url: body.lampiran_url || null,
      unit_kerja_asal: req.user?.unit_kerja || pejabat.unit_kerja || null,
      status: "draft_delegasi",
      revisi_ke: 0,
      jenis_bendahara: "pengeluaran",
      execution_thread_id: body.execution_thread_id ?? null,
      task_id: body.task_id != null && Number.isFinite(Number(body.task_id)) ? Number(body.task_id) : null,
    });

    return res.json({
      success: true,
      message: `Draft SPJ delegasi dibuat atas nama ${pejabat.nama_lengkap}. Belum bisa diproses sebelum pejabat mengkonfirmasi.`,
      data: row,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal membuat SPJ delegasi", error: err.message });
  }
}

// ── FINALISASI DRAFT DELEGASI → KIRIM NOTIFIKASI KE PEJABAT ─────────────────
// Setelah PPTK selesai mengisi dan upload lampiran, ubah status ke menunggu_konfirmasi_pejabat
export async function finalisasiDraftDelegasi(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);

    if (!ensureOwner(row, userId)) {
      return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    }
    if (row.status !== "draft_delegasi" && row.status !== "ditolak_pejabat") {
      return res.status(400).json({ success: false, message: "Hanya draft_delegasi atau ditolak_pejabat yang bisa difinalisasi" });
    }
    if (!row.lampiran_url) {
      return res.status(400).json({ success: false, message: "Wajib upload bukti pengeluaran sebelum mengirim ke pejabat" });
    }

    row.status = "menunggu_konfirmasi_pejabat";
    row.deadline_konfirmasi = tambahHariKerja(new Date(), 3); // 3 hari kerja
    row.catatan_penolakan_pejabat = null; // clear catatan penolakan sebelumnya
    await row.save();

    // TODO: kirim notifikasi ke pejabat (row.atas_nama_pejabat_id)
    // Notifikasi: "Ada draft SPJ atas nama Anda untuk diperiksa. Deadline: {deadline_konfirmasi}"

    return res.json({
      success: true,
      message: `SPJ dikirim ke pejabat untuk konfirmasi. Deadline: ${row.deadline_konfirmasi}`,
      data: row,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal finalisasi draft delegasi", error: err.message });
  }
}

// ── UPDATE SPJ (boleh edit selama draft / dikembalikan) ──────────────────────
export async function updateSpj(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    const threadUp = await gateOperationalUpdate(req, res, row);
    if (!threadUp) return;

    const editableStatuses = ["draft", "draft_delegasi", "ditolak_pejabat", "dikembalikan_bendahara", "dikembalikan_ppk"];
    if (!editableStatuses.includes(row.status)) {
      return res.status(400).json({ success: false, message: "SPJ tidak bisa diubah pada status ini" });
    }

    // Setelah dikonfirmasi pejabat, konten tidak boleh diubah
    if (row.jenis_kondisi === "delegasi" && row.konfirmasi_pejabat_at) {
      return res.status(403).json({
        success: false,
        message: "SPJ yang sudah dikonfirmasi pejabat tidak dapat diubah. Minta pejabat menolak dulu jika perlu koreksi.",
      });
    }

    const body = req.body || {};
    const editableFields = ["jenis_belanja", "sub_kegiatan_kode", "kode_rekening", "nominal", "keterangan", "uraian_kegiatan", "tanggal_kegiatan", "lampiran_url"];
    for (const k of editableFields) {
      if (body[k] != null) row[k] = body[k];
    }
    await row.save();
    return res.json({ success: true, message: "SPJ diperbarui", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update SPJ", error: err.message });
  }
}

// ── SUBMIT KE BENDAHARA (Kondisi A, atau B yang sudah dikonfirmasi pejabat) ──
export async function submitKeBendahara(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Spj.findByPk(id);
    if (!ensureOwner(row, userId)) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });

    const allowedStatuses = ["draft", "dikembalikan_bendahara", "dikembalikan_ppk", "dikonfirmasi_pejabat"];
    if (!allowedStatuses.includes(row.status)) {
      if (row.status === "menunggu_konfirmasi_pejabat") {
        return res.status(400).json({
          success: false,
          message: "SPJ delegasi ini masih menunggu konfirmasi pejabat. Tidak bisa dikirim ke Bendahara sebelum pejabat menyetujui.",
        });
      }
      if (row.status === "draft_delegasi") {
        return res.status(400).json({
          success: false,
          message: "Finalisasi draft dulu dan tunggu konfirmasi pejabat sebelum mengirim ke Bendahara.",
        });
      }
      return res.status(400).json({ success: false, message: "SPJ tidak bisa disubmit pada status ini" });
    }

    row.status = "diajukan_ke_bendahara";
    await row.save();
    return res.json({ success: true, message: "SPJ dikirim ke Bendahara Pengeluaran", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit SPJ ke Bendahara", error: err.message });
  }
}

// ── LIST SPJ DIKEMBALIKAN ───────────────────────────────────────────────────
export async function listSpjDikembalikan(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await Spj.findAll({
      where: {
        dibuat_oleh: userId,
        status: { [Op.in]: ["dikembalikan_bendahara", "dikembalikan_ppk", "ditolak_pejabat"] },
      },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ dikembalikan", error: err.message });
  }
}

// ── DAFTAR PEJABAT YANG BISA DIBUATKAN SPJ DELEGASI ────────────────────────
// Endpoint khusus untuk PPTK — tidak memerlukan super_admin.
// Mengembalikan pejabat dalam unit kerja yang sama dengan PPTK.
// Berlaku untuk semua unit: Sekretariat, Bidang Ketersediaan, Bidang Distribusi,
// Bidang Konsumsi, dan UPTD.

// Kata kunci kanonik per unit — dipilih yang UNIK per unit.
// Hindari kata yang muncul di lebih dari satu unit (misal "keamanan" ada di
// Konsumsi DAN UPTD, sehingga tidak dipakai sebagai pembeda).
const UNIT_CANONICAL_KEYWORDS = {
  sekretariat: ["sekretariat"],
  ketersediaan: ["ketersediaan", "kerawanan"],
  distribusi: ["distribusi", "cadangan"],
  konsumsi: ["konsumsi"],          // "keamanan" dibuang — tidak unik
  uptd: ["uptd", "balai", "mutu", "teknis", "pengujian", "pengawasan"],
};

// Kata umum yang TIDAK dipakai sebagai pembeda unit.
// "keamanan" masuk stop-word karena muncul di Bidang Konsumsi
// dan juga di UPTD Balai Pengujian Mutu dan Keamanan Produk.
const STOP_WORDS_UNIT = new Set([
  "dinas", "pangan", "dan", "atau", "sub", "bidang",
  "seksi", "maluku", "utara", "provinsi", "prov",
  "kantor", "badan", "lembaga", "unit",
  "keamanan",   // tidak unik — muncul di Konsumsi & UPTD
  "produk",     // tidak unik — generik
  "balai",      // masuk canonical UPTD, tidak perlu di keyword ekstraksi umum
]);

// Role yang TIDAK ditampilkan di dropdown pejabat SPJ delegasi.
// Pejabat yang berhak dibuatkan SPJ = pejabat struktural (Sekretaris, Kasubag,
// Kepala Bidang, Kepala Seksi, Kepala UPTD). Bendahara, Pelaksana, JF,
// Viewer, dan Super Admin dikecualikan.
const NON_PEJABAT_ROLES = [
  // Pelaksana (staf teknis)
  "pelaksana", "staf_pelaksana",
  "pelaksana_ketersediaan", "pelaksana_distribusi", "pelaksana_konsumsi",
  // Bendahara — verifikator SPJ, bukan penerima delegasi
  "bendahara", "bendahara_pengeluaran", "bendahara_gaji", "bendahara_barang",
  // Jabatan Fungsional — bukan pejabat struktural
  "fungsional", "jabatan_fungsional", "pejabat_fungsional",
  "fungsional_perencana", "fungsional_perencanaan", "fungsional_keuangan",
  "fungsional_analis", "fungsional_ketersediaan", "fungsional_distribusi",
  "fungsional_konsumsi", "fungsional_uptd_mutu", "fungsional_uptd_teknis",
  "ppk",
  // Lainnya
  "viewer", "publik", "super_admin",
];

/**
 * Ekstrak keyword bermakna dari string unit_kerja atau jabatan.
 * Contoh: "Distribusi-Dan-Cadangan-Pangan" → ["distribusi", "cadangan"]
 */
function extractUnitKeywords(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[-_\s,/()[\]]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !STOP_WORDS_UNIT.has(w));
}

/**
 * Ekstrak nama unit dari field jabatan format "[PPTK] ... (DPA: NamaUnit)"
 * Contoh: "[PPTK] Pelaksana Cadangan Pangan (DPA: Cadangan)" → "cadangan"
 */
function extractDpaFromJabatan(jabatan) {
  const match = String(jabatan || "").match(/DPA:\s*([^)]+)/i);
  if (!match) return [];
  return extractUnitKeywords(match[1]);
}

/**
 * Deteksi unit kanonik dari teks (unit_kerja atau jabatan).
 * Mengembalikan array keyword kanonik unit yang cocok.
 */
function detectCanonicalUnit(text) {
  const lower = String(text || "").toLowerCase();
  for (const [unit, keys] of Object.entries(UNIT_CANONICAL_KEYWORDS)) {
    if (keys.some((k) => lower.includes(k)) || lower.includes(unit)) {
      return keys;
    }
  }
  return [];
}

export async function getPejabatEligible(req, res) {
  try {
    const user = req.user;

    // Ambil data PPTK dari DB — sumber kebenaran untuk unit_kerja & jabatan
    const dbUser = await User.findByPk(user?.id, { attributes: ["jabatan", "unit_kerja"] });
    const jabatanRaw = dbUser?.jabatan || user?.jabatan || "";
    const jabatanUpper = String(jabatanRaw).toUpperCase();

    const isPptk = jabatanUpper.includes("PPTK");
    if (!isPptk) {
      return res.status(403).json({ success: false, message: "Hanya PPTK yang dapat mengakses daftar ini." });
    }

    const unitKerjaPptk = (dbUser?.unit_kerja || user?.unit_kerja || "").toLowerCase();

    // Lapisan 1: keyword dari unit_kerja
    const kwFromUnit = extractUnitKeywords(unitKerjaPptk);

    // Lapisan 2: keyword dari DPA di jabatan, contoh "(DPA: Cadangan)"
    const kwFromDpa = extractDpaFromJabatan(jabatanRaw);

    // Lapisan 3: deteksi unit kanonik sebagai fallback
    const kwCanonical = detectCanonicalUnit(unitKerjaPptk) || detectCanonicalUnit(jabatanRaw);

    // Gabungkan semua keyword, hilangkan duplikat
    const allKeywords = [...new Set([...kwFromUnit, ...kwFromDpa, ...kwCanonical])];

    // Ambil semua pejabat struktural (aktif, bukan diri sendiri)
    const allPejabat = await User.findAll({
      where: {
        is_active: true,
        role: { [Op.notIn]: NON_PEJABAT_ROLES },
        id: { [Op.ne]: user?.id },
      },
      attributes: ["id", "name", "jabatan", "unit_kerja", "role"],
      order: [["name", "ASC"]],
      limit: 200,
    });

    // Filter: cocokkan unit_kerja pejabat dengan keyword PPTK
    const inUnit = allPejabat.filter((p) => {
      const pu = (p.unit_kerja || "").toLowerCase();
      const pj = (p.jabatan || "").toLowerCase();
      return allKeywords.length > 0 && allKeywords.some((k) => pu.includes(k) || pj.includes(k));
    });

    // Fallback jika tidak ada yang cocok (data tidak konsisten di DB)
    const result = inUnit.length > 0 ? inUnit : allPejabat;
    const filtered = inUnit.length > 0;

    return res.json({
      success: true,
      filtered,
      unit_kerja_pptk: unitKerjaPptk,
      keywords_used: allKeywords,
      data: result.map((u) => ({
        id: u.id,
        nama_lengkap: u.name,
        jabatan: u.jabatan,
        unit_kerja: u.unit_kerja,
        role: u.role,
      })),
      total: result.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil daftar pejabat.", error: err.message });
  }
}

// ── STATISTIK SPJ SAYA ──────────────────────────────────────────────────────
export async function statsSaya(req, res) {
  try {
    const userId = req.user?.id;
    const all = await Spj.findAll({ where: { dibuat_oleh: userId }, attributes: ["status"] });
    const counts = {};
    all.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return res.json({ success: true, data: counts, total: all.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal hitung statistik", error: err.message });
  }
}
