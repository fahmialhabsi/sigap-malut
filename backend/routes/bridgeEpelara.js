/**
 * Bridge HTTP untuk integrasi e-PELARA (LK / BKU) ↔ SIGAP-MALUT.
 * GET /api/bridge/spj-approved?tahun=2024
 *
 * Opsional: set EPELARA_BRIDGE_TOKEN di .env SIGAP; jika di-set, wajib header
 * Authorization: Bearer <token> (nilai sama dengan SIGAP_SYNC_TOKEN di e-PELARA).
 */
import express from "express";
import { Op } from "sequelize";
import Spj from "../models/Spj.js";

const router = express.Router();

function bridgeAuth(req, res, next) {
  const expected = process.env.EPELARA_BRIDGE_TOKEN;
  if (!expected || !String(expected).trim()) return next();
  const h = String(req.headers.authorization || "");
  const tok = String(expected).trim();
  const ok =
    h === `Bearer ${tok}` ||
    h === tok ||
    h.replace(/^Bearer\s+/i, "").trim() === tok;
  if (!ok) {
    return res.status(401).json({ message: "Bridge: token tidak valid" });
  }
  return next();
}

router.get("/spj-approved", bridgeAuth, async (req, res) => {
  try {
    const tahun = parseInt(String(req.query.tahun || ""), 10);
    if (!Number.isFinite(tahun) || tahun < 2000 || tahun > 2100) {
      return res.status(400).json({ message: "Query tahun wajib (2000–2100)" });
    }

    const rows = await Spj.findAll({
      where: {
        status: "terverifikasi_ppk",
        tanggal_kegiatan: {
          [Op.gte]: `${tahun}-01-01`,
          [Op.lte]: `${tahun}-12-31`,
        },
      },
      order: [["tanggal_kegiatan", "DESC"], ["id", "DESC"]],
      raw: true,
    });

    const data = rows.map((r) => ({
      id: r.id,
      tanggal: r.tanggal_kegiatan,
      tanggal_kegiatan: r.tanggal_kegiatan,
      nomor_spj: r.nomor_spj,
      nominal: r.nominal != null ? Number(r.nominal) : null,
      kode_rekening: r.kode_rekening,
      jenis_spj: r.jenis_belanja,
      jenis_belanja: r.jenis_belanja,
      kode_sub_kegiatan: r.sub_kegiatan_kode,
      uraian: r.uraian_kegiatan || r.keterangan || null,
      uraian_kegiatan: r.uraian_kegiatan || null,
      nomor_spm: r.nomor_spm || null,
      tanggal_spm: r.tanggal_spm || null,
      status: r.status,
    }));

    return res.json({ data });
  } catch (e) {
    console.error("[bridgeEpelara] spj-approved:", e);
    return res.status(500).json({ message: e.message || "Gagal memuat SPJ" });
  }
});

export default router;
