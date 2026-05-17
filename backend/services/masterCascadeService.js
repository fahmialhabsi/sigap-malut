/**
 * Data untuk dropdown cascade Program → Kegiatan → Sub → Indikator.
 */

import { Op } from "sequelize";
import MasterProgram from "../models/MasterProgram.js";
import MasterKegiatan from "../models/MasterKegiatan.js";
import MasterSubKegiatan from "../models/MasterSubKegiatan.js";
import MasterIndikator from "../models/MasterIndikator.js";

const MAX_ROWS = 300;

function searchWhere(q) {
  const s = String(q || "").trim();
  if (!s) return {};
  return {
    [Op.or]: [
      { kode: { [Op.like]: `%${s}%` } },
      { nama: { [Op.like]: `%${s}%` } },
    ],
  };
}

export async function listPrograms({ regulasiVersiId, datasetKey, q }) {
  const where = {
    regulasi_versi_id: regulasiVersiId,
    ...searchWhere(q),
  };
  if (datasetKey != null && String(datasetKey).trim() !== "") {
    where.dataset_key = String(datasetKey).trim();
  }

  const rows = await MasterProgram.findAll({
    where,
    order: [
      ["kode", "ASC"],
      ["id", "ASC"],
    ],
    limit: MAX_ROWS,
    raw: true,
  });

  return rows.map((r) => ({
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    label: `${r.kode} — ${r.nama}`,
    regulasi_versi_id: r.regulasi_versi_id,
    dataset_key: r.dataset_key,
  }));
}

export async function listKegiatan({ regulasiVersiId, masterProgramId, q }) {
  const rows = await MasterKegiatan.findAll({
    where: {
      regulasi_versi_id: regulasiVersiId,
      master_program_id: masterProgramId,
      ...searchWhere(q),
    },
    order: [
      ["kode", "ASC"],
      ["id", "ASC"],
    ],
    limit: MAX_ROWS,
    raw: true,
  });

  return rows.map((r) => ({
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    label: `${r.kode} — ${r.nama}`,
    regulasi_versi_id: r.regulasi_versi_id,
    master_program_id: r.master_program_id,
  }));
}

export async function listSubKegiatan({ regulasiVersiId, masterKegiatanId, q }) {
  const rows = await MasterSubKegiatan.findAll({
    where: {
      regulasi_versi_id: regulasiVersiId,
      master_kegiatan_id: masterKegiatanId,
      ...searchWhere(q),
    },
    order: [
      ["kode", "ASC"],
      ["id", "ASC"],
    ],
    limit: MAX_ROWS,
    raw: true,
  });

  return rows.map((r) => ({
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    label: `${r.kode} — ${r.nama}`,
    regulasi_versi_id: r.regulasi_versi_id,
    master_kegiatan_id: r.master_kegiatan_id,
  }));
}

export async function listIndikator({ regulasiVersiId, masterSubKegiatanId, datasetKey, q }) {
  try {
    const where = {
      regulasi_versi_id: regulasiVersiId,
      master_sub_kegiatan_id: masterSubKegiatanId,
      ...searchWhere(q),
    };
    if (datasetKey != null && String(datasetKey).trim() !== "") {
      where.dataset_key = String(datasetKey).trim();
    }

    const rows = await MasterIndikator.findAll({
      where,
      order: [
        ["kode", "ASC"],
        ["id", "ASC"],
      ],
      limit: MAX_ROWS,
      raw: true,
    });

    return rows.map((r) => ({
      id: r.id,
      kode: r.kode,
      nama: r.nama,
      satuan: r.satuan,
      label: `${r.kode} — ${r.nama}${r.satuan ? ` (${r.satuan})` : ""}`,
      regulasi_versi_id: r.regulasi_versi_id,
      master_sub_kegiatan_id: r.master_sub_kegiatan_id,
      dataset_key: r.dataset_key,
    }));
  } catch (e) {
    if (String(e?.message || "").toLowerCase().includes("no such table")) {
      return [];
    }
    if (String(e?.message || "").includes("does not exist")) {
      return [];
    }
    throw e;
  }
}
