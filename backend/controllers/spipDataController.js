import SpipRiskRegister from "../models/SpipRiskRegister.js";
import SpipRtp from "../models/SpipRtp.js";
import SpipMonitoring from "../models/SpipMonitoring.js";
import SpipEvidenceLink from "../models/SpipEvidenceLink.js";

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
  return out;
}

function parseLimit(v, def = 50, max = 500) {
  const n = v == null || v === "" ? def : parseInt(String(v), 10);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(max, n);
}

function parseOffset(v, def = 0) {
  const n = v == null || v === "" ? def : parseInt(String(v), 10);
  if (!Number.isFinite(n) || n < 0) return def;
  return n;
}

export async function listRisks(req, res) {
  try {
    const limit = parseLimit(req.query.limit, 100);
    const offset = parseOffset(req.query.offset, 0);
    const where = {};
    if (req.query.unit_kerja) where.unit_kerja = String(req.query.unit_kerja);
    if (req.query.periode_tahun) where.periode_tahun = parseInt(String(req.query.periode_tahun), 10);
    if (req.query.status) where.status = String(req.query.status);
    const rows = await SpipRiskRegister.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil risk register", error: error.message });
  }
}

export async function listRtps(req, res) {
  try {
    const limit = parseLimit(req.query.limit, 200);
    const offset = parseOffset(req.query.offset, 0);
    const where = {};
    if (req.query.risk_id) where.risk_id = parseInt(String(req.query.risk_id), 10);
    if (req.query.status) where.status = String(req.query.status);
    const rows = await SpipRtp.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil RTP", error: error.message });
  }
}

export async function listMonitoring(req, res) {
  try {
    const limit = parseLimit(req.query.limit, 200);
    const offset = parseOffset(req.query.offset, 0);
    const where = {};
    if (req.query.risk_id) where.risk_id = parseInt(String(req.query.risk_id), 10);
    if (req.query.jenis) where.jenis = String(req.query.jenis);
    const rows = await SpipMonitoring.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil pemantauan", error: error.message });
  }
}

export async function listEvidenceLinks(req, res) {
  try {
    const limit = parseLimit(req.query.limit, 200);
    const offset = parseOffset(req.query.offset, 0);
    const where = {};
    if (req.query.spip_ref_type) where.spip_ref_type = String(req.query.spip_ref_type);
    if (req.query.spip_ref_id) where.spip_ref_id = parseInt(String(req.query.spip_ref_id), 10);
    if (req.query.sumber_modul) where.sumber_modul = String(req.query.sumber_modul);
    const rows = await SpipEvidenceLink.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil evidence link", error: error.message });
  }
}

export async function createRisk(req, res) {
  try {
    const payload = pick(req.body, [
      "unit_kerja",
      "periode_tahun",
      "kode_risiko",
      "nama_risiko",
      "kategori_risiko",
      "sasaran_konteks",
      "proses_bisnis_konteks",
      "pemilik_risiko",
      "status",
    ]);
    if (!payload.unit_kerja || !payload.nama_risiko) {
      return res.status(400).json({
        success: false,
        message: "unit_kerja dan nama_risiko wajib diisi",
      });
    }
    const created = await SpipRiskRegister.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat risk register", error: error.message });
  }
}

export async function createRtp(req, res) {
  try {
    const payload = pick(req.body, [
      "risk_id",
      "uraian_rtp",
      "penanggung_jawab",
      "target_tanggal",
      "status",
      "realized_at",
    ]);
    if (!payload.risk_id || !payload.uraian_rtp) {
      return res.status(400).json({ success: false, message: "risk_id dan uraian_rtp wajib diisi" });
    }
    const created = await SpipRtp.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat RTP", error: error.message });
  }
}

export async function createMonitoring(req, res) {
  try {
    const payload = pick(req.body, ["risk_id", "jenis", "tanggal", "uraian", "hasil", "nilai"]);
    if (!payload.risk_id || !payload.jenis || !payload.tanggal) {
      return res.status(400).json({ success: false, message: "risk_id, jenis, tanggal wajib diisi" });
    }
    const created = await SpipMonitoring.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat pemantauan", error: error.message });
  }
}

export async function createEvidenceLink(req, res) {
  try {
    const payload = pick(req.body, [
      "spip_ref_type",
      "spip_ref_id",
      "sumber_modul",
      "sumber_tabel",
      "sumber_id",
      "judul",
      "url",
      "occurred_at",
      "created_by",
    ]);
    if (!payload.spip_ref_type || !payload.spip_ref_id || !payload.sumber_modul) {
      return res.status(400).json({ success: false, message: "spip_ref_type, spip_ref_id, sumber_modul wajib diisi" });
    }
    const created = await SpipEvidenceLink.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat evidence link", error: error.message });
  }
}

