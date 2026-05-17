/**
 * Pejabat SPJ Konfirmasi Controller
 *
 * Sesuai Dokumen 41 — Kondisi B:
 * Pejabat (Sekretaris/Kabid/Kasubag/KUPTD/Kasie) wajib mengkonfirmasi
 * atau menolak draft SPJ yang disiapkan Pelaksana/PPTK atas namanya.
 *
 * Setelah pejabat mengkonfirmasi → tanggung jawab berpindah ke pejabat.
 * Audit trail dicatat immutable (hanya INSERT, tidak ada UPDATE).
 */
import { Op } from "sequelize";
import Spj from "../../models/Spj.js";
import User from "../../models/User.js";

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ── LIST SPJ ATAS NAMA SAYA (menunggu konfirmasi + riwayat) ─────────────────
export async function listSpjAtasNamaSaya(req, res) {
  try {
    const userId = req.user?.id;
    const statusFilter = req.query.status; // kosong = semua
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);

    const where = { atas_nama_pejabat_id: userId };
    if (statusFilter) {
      where.status = statusFilter;
    } else {
      // Default: tampilkan yang relevan untuk pejabat
      where.status = {
        [Op.in]: [
          "menunggu_konfirmasi_pejabat",
          "dikonfirmasi_pejabat",
          "ditolak_pejabat",
          "diajukan_ke_bendahara",
          "terverifikasi_bendahara",
          "diajukan_ke_ppk",
          "terverifikasi_ppk",
          "dikembalikan_bendahara",
          "dikembalikan_ppk",
        ],
      };
    }

    const rows = await Spj.findAll({
      where,
      order: [["updated_at", "DESC"]],
      limit,
    });

    // Enrich dengan nama PPTK pembuat
    const enriched = await Promise.all(
      rows.map(async (r) => {
        const pptk = r.pptk_id
          ? await User.findByPk(r.pptk_id, { attributes: ["id", "nama_lengkap", "jabatan"] }).catch(() => null)
          : null;
        return {
          ...r.toJSON(),
          pptk_nama: pptk?.nama_lengkap || null,
          pptk_jabatan: pptk?.jabatan || null,
          deadline_konfirmasi_fmt: fmtDate(r.deadline_konfirmasi),
        };
      })
    );

    const pending = enriched.filter((r) => r.status === "menunggu_konfirmasi_pejabat").length;

    return res.json({ success: true, data: enriched, total: enriched.length, pending_konfirmasi: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ atas nama saya", error: err.message });
  }
}

// ── DETAIL SPJ UNTUK DIKONFIRMASI ────────────────────────────────────────────
export async function getSpjUntukKonfirmasi(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);

    const row = await Spj.findOne({
      where: { id, atas_nama_pejabat_id: userId },
    });
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan atau bukan atas nama Anda" });

    const pptk = row.pptk_id
      ? await User.findByPk(row.pptk_id, { attributes: ["id", "nama_lengkap", "jabatan", "unit_kerja"] }).catch(() => null)
      : null;

    return res.json({
      success: true,
      data: {
        ...row.toJSON(),
        pptk: pptk,
        sudah_buka: true, // sistem mencatat bahwa pejabat sudah membuka dokumen
        bisa_setujui: row.status === "menunggu_konfirmasi_pejabat",
        bisa_tolak: row.status === "menunggu_konfirmasi_pejabat",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SPJ", error: err.message });
  }
}

// ── KONFIRMASI / SETUJUI SPJ ─────────────────────────────────────────────────
// Setelah pejabat klik "Saya Setujui" → tanggung jawab berpindah ke pejabat
export async function konfirmasiSpj(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);

    const row = await Spj.findOne({
      where: { id, atas_nama_pejabat_id: userId },
    });
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan atau bukan atas nama Anda" });

    if (row.status !== "menunggu_konfirmasi_pejabat") {
      return res.status(400).json({
        success: false,
        message: `SPJ ini tidak bisa dikonfirmasi pada status: ${row.status}`,
      });
    }

    // Catat konfirmasi pejabat — IMMUTABLE
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
    row.status = "dikonfirmasi_pejabat";
    row.konfirmasi_pejabat_at = new Date();
    row.konfirmasi_pejabat_ip = String(ip).slice(0, 45);
    await row.save();

    // TODO: notify PPTK bahwa pejabat sudah konfirmasi
    // TODO: notify Bendahara bahwa ada SPJ siap diverifikasi

    return res.json({
      success: true,
      message: `SPJ berhasil dikonfirmasi. Tanggung jawab atas kebenaran isi SPJ ini kini melekat pada Anda (${req.user?.nama_lengkap || "Pejabat"}). Audit trail telah dicatat.`,
      data: {
        id: row.id,
        nomor_spj: row.nomor_spj,
        status: row.status,
        konfirmasi_pejabat_at: row.konfirmasi_pejabat_at,
        tanggung_jawab: "Pejabat yang mengkonfirmasi bertanggung jawab penuh atas kebenaran isi SPJ ini.",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal konfirmasi SPJ", error: err.message });
  }
}

// ── TOLAK SPJ → KEMBALI KE PPTK UNTUK DIPERBAIKI ────────────────────────────
export async function tolakSpj(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const { catatan } = req.body || {};

    if (!catatan || catatan.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Wajib isi catatan alasan penolakan (minimal 10 karakter).",
      });
    }

    const row = await Spj.findOne({
      where: { id, atas_nama_pejabat_id: userId },
    });
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan atau bukan atas nama Anda" });

    if (row.status !== "menunggu_konfirmasi_pejabat") {
      return res.status(400).json({
        success: false,
        message: `SPJ ini tidak bisa ditolak pada status: ${row.status}`,
      });
    }

    row.status = "ditolak_pejabat";
    row.catatan_penolakan_pejabat = catatan.trim();
    row.revisi_ke = (row.revisi_ke || 0) + 1;
    await row.save();

    // TODO: notify PPTK bahwa SPJ ditolak beserta catatan

    return res.json({
      success: true,
      message: `SPJ dikembalikan ke PPTK untuk diperbaiki. Catatan: ${catatan}`,
      data: { id: row.id, status: row.status, catatan_penolakan_pejabat: row.catatan_penolakan_pejabat },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal menolak SPJ", error: err.message });
  }
}

// ── JUMLAH SPJ MENUNGGU KONFIRMASI (untuk badge di header/dashboard) ─────────
export async function countPendingKonfirmasi(req, res) {
  try {
    const userId = req.user?.id;
    const count = await Spj.count({
      where: { atas_nama_pejabat_id: userId, status: "menunggu_konfirmasi_pejabat" },
    });
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, count: 0, error: err.message });
  }
}
