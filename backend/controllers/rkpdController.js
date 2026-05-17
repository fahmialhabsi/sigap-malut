import { Rkpd, Renja } from "../models/index.js";

function toDecimal(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(String(val).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function resolvePagu(body) {
  return toDecimal(body.pagu_anggaran ?? body.pagu ?? body.anggaran);
}

export async function list(req, res) {
  try {
    const where = {};
    if (req.query.tahun) where.tahun = Number(req.query.tahun);
    if (req.query.renja_id) where.renja_id = Number(req.query.renja_id);

    const includeRenja =
      req.query.include_renja === "1" ||
      req.query.include_renja === "true" ||
      req.query.includeRenja === "1";

    const rows = await Rkpd.findAll({
      where,
      order: [
        ["tahun", "DESC"],
        ["id", "DESC"],
      ],
      include: includeRenja ? [{ model: Renja, as: "renja", required: false }] : undefined,
    });

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("rkpd list", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat RKPD",
    });
  }
}

export async function getById(req, res) {
  try {
    const row = await Rkpd.findByPk(req.params.id, {
      include: [{ model: Renja, as: "renja", required: false }],
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "RKPD tidak ditemukan" });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("rkpd getById", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat RKPD",
    });
  }
}

export async function create(req, res) {
  try {
    const body = req.body;
    const renja = await Renja.findByPk(body.renja_id);
    if (!renja) {
      return res.status(400).json({ success: false, message: "renja_id tidak valid" });
    }
    if (Number(renja.tahun) !== Number(body.tahun)) {
      return res.status(400).json({
        success: false,
        message: `Tahun RKPD harus sama dengan tahun Renja induk (${renja.tahun})`,
      });
    }

    const row = await Rkpd.create({
      tahun: body.tahun,
      renja_id: body.renja_id,
      nama_sub_kegiatan: body.nama_sub_kegiatan,
      indikator: body.indikator,
      target: body.target ?? null,
      pagu: resolvePagu(body),
      periode_rpjmd_id: body.periode_rpjmd_id ?? null,
      status: body.status || "draft",
      dibuat_oleh: req.user?.id ?? null,
    });

    const fresh = await Rkpd.findByPk(row.id, {
      include: [{ model: Renja, as: "renja", required: false }],
    });
    return res.status(201).json({ success: true, data: fresh });
  } catch (err) {
    console.error("rkpd create", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal menyimpan RKPD",
    });
  }
}

export async function update(req, res) {
  try {
    const row = await Rkpd.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "RKPD tidak ditemukan" });
    }
    const body = req.body;
    const patch = { ...body };
    if ("pagu" in body || "pagu_anggaran" in body || "anggaran" in body) {
      patch.pagu = resolvePagu(body);
      delete patch.pagu_anggaran;
      delete patch.anggaran;
    }
    if (body.renja_id) {
      const renja = await Renja.findByPk(body.renja_id);
      if (!renja) {
        return res.status(400).json({ success: false, message: "renja_id tidak valid" });
      }
      const targetTahun = body.tahun ?? row.tahun;
      if (Number(renja.tahun) !== Number(targetTahun)) {
        return res.status(400).json({
          success: false,
          message: `Tahun RKPD harus sama dengan tahun Renja induk (${renja.tahun})`,
        });
      }
    }
    delete patch.id;
    await row.update(patch);
    const fresh = await Rkpd.findByPk(row.id, {
      include: [{ model: Renja, as: "renja", required: false }],
    });
    return res.json({ success: true, data: fresh });
  } catch (err) {
    console.error("rkpd update", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memperbarui RKPD",
    });
  }
}

export async function remove(req, res) {
  try {
    const row = await Rkpd.findByPk(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "RKPD tidak ditemukan" });
    }
    await row.destroy();
    return res.json({ success: true, message: "RKPD dihapus" });
  } catch (err) {
    console.error("rkpd delete", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal menghapus RKPD",
    });
  }
}
