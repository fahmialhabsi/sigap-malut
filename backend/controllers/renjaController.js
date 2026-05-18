import { Renja, Rkpd, Renstra, sequelize } from "../models/index.js";
import { linkRenjaToRkpd } from "../services/renjaRkpdLinkService.js";

function toDecimal(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(String(val).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function buildJudul(body) {
  const explicit = String(body.judul || "").trim();
  if (explicit) return explicit.slice(0, 255);
  const p = String(body.program || "").trim();
  const k = String(body.kegiatan || "").trim();
  const combined = [p, k].filter(Boolean).join(" — ");
  return combined.slice(0, 255) || "Renja";
}

export async function getMeta(req, res) {
  try {
    const qi = sequelize.getQueryInterface();
    const description = await qi.describeTable("renja");
    const columns = Object.entries(description).map(([name, detail]) => ({
      name,
      type: detail.type,
      allowNull: detail.allowNull,
      defaultValue: detail.defaultValue,
      primaryKey: Boolean(detail.primaryKey),
    }));
    return res.json({
      success: true,
      data: { table: "renja", columns },
    });
  } catch (err) {
    console.error("renja meta", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal membaca metadata renja",
    });
  }
}

export async function list(req, res) {
  try {
    const includeRkpd =
      req.query.include_rkpd === "1" ||
      req.query.include_rkpd === "true" ||
      req.query.include_rkpds === "1";

    const where = {};
    if (req.query.tahun) where.tahun = Number(req.query.tahun);

    const limitRaw = req.query.limit != null ? Number(req.query.limit) : null;
    const limit =
      limitRaw != null && Number.isFinite(limitRaw)
        ? Math.min(Math.max(limitRaw, 1), 2000)
        : null;

    const rows = await Renja.findAll({
      where,
      ...(limit ? { limit } : {}),
      order: [
        ["tahun", "DESC"],
        ["id", "DESC"],
      ],
      include: includeRkpd
        ? [{ model: Rkpd, as: "rkpds", required: false }]
        : undefined,
    });

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("renja list", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat Renja",
    });
  }
}

export async function getById(req, res) {
  try {
    const row = await Renja.findByPk(req.params.id, {
      include: [
        { model: Rkpd, as: "rkpds", required: false },
        { model: Renstra, as: "renstra", required: false },
      ],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Renja tidak ditemukan" });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("renja getById", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat detail Renja",
    });
  }
}

export async function listRkpdByRenjaId(req, res) {
  try {
    const renjaId = req.params.id;
    const renja = await Renja.findByPk(renjaId);
    if (!renja) {
      return res.status(404).json({ success: false, message: "Renja tidak ditemukan" });
    }
    const rows = await Rkpd.findAll({
      where: { renja_id: renjaId },
      order: [
        ["tahun", "DESC"],
        ["id", "DESC"],
      ],
      include: [{ model: Renja, as: "renja", required: false }],
    });
    return res.json({
      success: true,
      data: {
        renja,
        rkpds: rows,
      },
    });
  } catch (err) {
    console.error("renja/:id/rkpd", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat RKPD untuk Renja",
    });
  }
}

export async function create(req, res) {
  try {
    const body = req.body;
    const pagu = toDecimal(body.pagu ?? body.anggaran);
    const row = await Renja.create({
      tahun: body.tahun,
      renstra_id: body.renstra_id ?? null,
      perangkat_daerah: body.perangkat_daerah ?? null,
      program: body.program,
      kegiatan: body.kegiatan,
      indikator: body.indikator,
      target: body.target ?? null,
      pagu,
      judul: buildJudul(body),
      status: body.status || "draft",
      dibuat_oleh: req.user?.id ?? null,
    });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("renja create", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal menyimpan Renja",
    });
  }
}

export async function update(req, res) {
  try {
    const row = await Renja.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Renja tidak ditemukan" });
    }
    const body = req.body;
    const plain = row.get({ plain: true });
    const merged = { ...plain, ...body };
    const patch = {
      tahun: merged.tahun,
      renstra_id: merged.renstra_id,
      perangkat_daerah: merged.perangkat_daerah,
      program: merged.program,
      kegiatan: merged.kegiatan,
      indikator: merged.indikator,
      target: merged.target,
      status: merged.status,
    };
    if ("pagu" in body || "anggaran" in body) {
      patch.pagu = toDecimal(body.pagu ?? body.anggaran);
    } else if (body.pagu !== undefined) {
      patch.pagu = toDecimal(body.pagu);
    }
    if (body.program || body.kegiatan || body.judul) {
      patch.judul = buildJudul(merged);
    }
    Object.keys(patch).forEach((k) => {
      if (patch[k] === undefined) delete patch[k];
    });
    await row.update(patch);
    const fresh = await Renja.findByPk(row.id, {
      include: [{ model: Rkpd, as: "rkpds", required: false }],
    });
    return res.json({ success: true, data: fresh });
  } catch (err) {
    console.error("renja update", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memperbarui Renja",
    });
  }
}

export async function remove(req, res) {
  try {
    const row = await Renja.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Renja tidak ditemukan" });
    }
    await row.destroy();
    return res.json({ success: true, message: "Renja dihapus" });
  } catch (err) {
    console.error("renja delete", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal menghapus Renja",
    });
  }
}

export async function postLinkRkpd(req, res) {
  try {
    const dryRun = req.query.dry_run === "1" || req.query.dry_run === "true";
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await linkRenjaToRkpd({ dryRun, limit });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("link rkpd", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal menautkan RKPD ke Renja",
    });
  }
}
