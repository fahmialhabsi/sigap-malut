import { Op } from "sequelize";
import Spj from "../../models/Spj.js";
import BukuKasUmum from "../../models/BukuKasUmum.js";
import UangPersediaan from "../../models/UangPersediaan.js";

function toNum(x) {
  const n = Number(String(x ?? 0).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

async function hitungSaldoUpTahunIni() {
  const now = new Date();
  const tahun = now.getFullYear();
  const upAwal = await UangPersediaan.sum("nominal_cair", {
    where: { tahun_anggaran: tahun, jenis: "up_awal", status: "cair" },
  }).catch(() => 0);
  const guCair = await UangPersediaan.sum("nominal_cair", {
    where: { tahun_anggaran: tahun, jenis: "gu", status: "cair" },
  }).catch(() => 0);
  const totalMasuk = toNum(upAwal) + toNum(guCair);
  const totalKeluar = await Spj.sum("nominal", { where: { status: "dibayarkan" } }).catch(() => 0);
  return Math.max(0, totalMasuk - toNum(totalKeluar));
}

export async function listSpjMasuk(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const rows = await Spj.findAll({
      where: { status: { [Op.in]: ["diajukan_ke_bendahara", "dikembalikan_bendahara"] } },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ masuk", error: err.message });
  }
}

export async function listDikembalikanPpk(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const rows = await Spj.findAll({
      where: { status: "dikembalikan_ppk" },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil dikembalikan PPK", error: err.message });
  }
}

export async function listSiapDibayar(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const rows = await Spj.findAll({
      where: { status: "disetujui_sekretaris" },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil siap dibayar", error: err.message });
  }
}

export async function verifikasiOk(req, res) {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const row = await Spj.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    if (!["diajukan_ke_bendahara", "dikembalikan_bendahara"].includes(row.status)) {
      return res.status(400).json({ success: false, message: "SPJ bukan dalam antrean verifikasi bendahara" });
    }
    row.status = "terverifikasi_bendahara";
    row.diverifikasi_bendahara_oleh = userId;
    row.diverifikasi_bendahara_at = new Date();
    row.catatan_bendahara = req.body?.catatan_bendahara || null;
    await row.save();
    return res.json({ success: true, message: "Verifikasi administrasi OK", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal verifikasi OK", error: err.message });
  }
}

export async function kembalikanKePelaksana(req, res) {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const { catatan_bendahara } = req.body || {};
    if (!catatan_bendahara) {
      return res.status(400).json({ success: false, message: "catatan_bendahara wajib diisi" });
    }
    const row = await Spj.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    row.status = "dikembalikan_bendahara";
    row.diverifikasi_bendahara_oleh = userId;
    row.diverifikasi_bendahara_at = new Date();
    row.catatan_bendahara = catatan_bendahara;
    row.revisi_ke = (row.revisi_ke || 0) + 1;
    await row.save();
    return res.json({ success: true, message: "SPJ dikembalikan ke Pelaksana", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengembalikan SPJ", error: err.message });
  }
}

export async function kirimKePpk(req, res) {
  try {
    const id = req.params.id;
    const row = await Spj.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    if (row.status !== "terverifikasi_bendahara") {
      return res.status(400).json({ success: false, message: "SPJ harus terverifikasi bendahara dulu" });
    }
    row.status = "diajukan_ke_ppk";
    await row.save();
    return res.json({ success: true, message: "SPJ dikirim ke PPK", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal kirim ke PPK", error: err.message });
  }
}

export async function prosesPembayaran(req, res) {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const { metode, nomor_bukti } = req.body || {};
    const row = await Spj.findByPk(id);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    if (row.status !== "disetujui_sekretaris") {
      return res.status(400).json({
        success: false,
        message: "Pembayaran hanya boleh setelah disetujui Sekretaris",
      });
    }
    row.status = "dibayarkan";
    row.dibayarkan_oleh = userId;
    row.dibayarkan_at = new Date();
    row.keterangan = [row.keterangan, metode ? `Metode: ${metode}` : null, nomor_bukti ? `Bukti: ${nomor_bukti}` : null]
      .filter(Boolean)
      .join("\n");
    await row.save();

    const saldoSetelah = await hitungSaldoUpTahunIni();
    await BukuKasUmum.create({
      tanggal: new Date().toISOString().slice(0, 10),
      uraian: `Pembayaran SPJ ${row.nomor_spj || `#${row.id}`}`,
      nomor_bukti: nomor_bukti || row.nomor_spj || null,
      jenis_transaksi: "kredit",
      nominal: row.nominal,
      saldo_setelah: saldoSetelah,
      referensi_tabel: "spj",
      referensi_id: row.id,
      keterangan: metode ? `Metode: ${metode}` : null,
      input_otomatis: true,
      dibuat_oleh: userId,
    }).catch(() => null);

    return res.json({ success: true, message: "Pembayaran diproses", data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal proses pembayaran", error: err.message });
  }
}

