import { fn, col, Op } from "sequelize";
import HargaPangan from "../models/HargaPangan.js";
import Komoditas from "../models/komoditas.js";

const STATUS = {
  DRAFT: "draft",
  MENUNGGU: "menunggu_verifikasi",
  TERVERIFIKASI: "terverifikasi",
  DIKEMBALIKAN: "dikembalikan",
};

export async function resolveKomoditasId(baris) {
  if (baris.komoditas_id) return baris.komoditas_id;
  const nama = baris.nama || baris.nama_komoditas;
  if (!nama) return null;
  const trimmed = nama.trim();
  let row = await Komoditas.findOne({ where: { nama: trimmed } });
  if (!row) {
    row = await Komoditas.findOne({
      where: { nama: { [Op.like]: `%${trimmed}%` } },
    });
  }
  return row?.id ?? null;
}

export async function insertHargaPanganRows(rows) {
  return HargaPangan.bulkCreate(rows);
}

export async function findHargaPanganByPk(id) {
  return HargaPangan.findByPk(id);
}

/**
 * Harga acuan hari sebelumnya (outlet sama) untuk deteksi lonjakan; hanya baris terverifikasi/menunggu.
 */
export async function getReferencePricePreviousDay({
  diinput_oleh,
  tanggalKemarin,
  pasar_id,
  pasar_nama,
  komoditas_key,
}) {
  if (!komoditas_key || !tanggalKemarin) return null;
  const where = {
    diinput_oleh,
    tanggal: tanggalKemarin,
    komoditas_key,
    status: { [Op.in]: [STATUS.TERVERIFIKASI, STATUS.MENUNGGU] },
  };
  if (pasar_id != null && pasar_id !== "") where.pasar_id = pasar_id;
  else if (pasar_nama) where.pasar_nama = pasar_nama;

  const row = await HargaPangan.findOne({
    where,
    order: [["updated_at", "DESC"]],
    raw: true,
  });
  return row ? Number(row.harga_eceran) : null;
}

export async function listPendingVerificationBatches() {
  const rows = await HargaPangan.findAll({
    attributes: [
      "batch_id",
      [fn("MIN", col("created_at")), "dibuat_pada"],
      [fn("COUNT", col("id")), "jumlah_baris"],
    ],
    where: { status: STATUS.MENUNGGU },
    group: ["batch_id"],
    order: [[fn("MIN", col("created_at")), "DESC"]],
    subQuery: false,
    raw: true,
  });

  const anomalyRows = await HargaPangan.findAll({
    attributes: ["batch_id"],
    where: { status: STATUS.MENUNGGU, is_anomaly: true },
    raw: true,
  });
  const anomSet = new Set(anomalyRows.map((r) => r.batch_id));

  return rows.map((r) => ({
    batch_id: r.batch_id,
    dibuat_pada: r.dibuat_pada,
    jumlah_baris: Number(r.jumlah_baris),
    batch_has_anomaly: anomSet.has(r.batch_id),
  }));
}

export async function verifyBatch(batchId, verifikatorId, catatan) {
  const rowsBefore = await HargaPangan.findAll({
    where: { batch_id: batchId, status: STATUS.MENUNGGU },
    raw: true,
  });
  if (rowsBefore.length === 0) return { ok: false, rowsBefore: [] };

  const [n] = await HargaPangan.update(
    {
      status: STATUS.TERVERIFIKASI,
      diverifikasi_oleh: verifikatorId,
      catatan_verifikasi: catatan || null,
    },
    { where: { batch_id: batchId, status: STATUS.MENUNGGU } },
  );
  return { ok: n > 0, rowsBefore };
}

export async function returnBatchToPelaksana(batchId, verifikatorId, catatan) {
  const rowsBefore = await HargaPangan.findAll({
    where: { batch_id: batchId, status: STATUS.MENUNGGU },
    raw: true,
  });
  if (rowsBefore.length === 0) return { ok: false, rowsBefore: [] };

  const [n] = await HargaPangan.update(
    {
      status: STATUS.DIKEMBALIKAN,
      diverifikasi_oleh: verifikatorId,
      catatan_verifikasi: catatan,
    },
    { where: { batch_id: batchId, status: STATUS.MENUNGGU } },
  );
  return { ok: n > 0, rowsBefore };
}

export async function findByUserAndDate(diinput_oleh, tanggal) {
  return HargaPangan.findAll({
    where: { diinput_oleh, tanggal },
    order: [["created_at", "DESC"]],
  });
}

export async function coverageForUser(diinput_oleh, tanggal, assignedTotal) {
  const rows = await HargaPangan.findAll({
    attributes: ["pasar_id", "pasar_nama"],
    where: {
      diinput_oleh,
      tanggal,
      status: { [Op.in]: [STATUS.MENUNGGU, STATUS.TERVERIFIKASI] },
    },
    raw: true,
  });
  const set = new Set(
    rows.map((r) => (r.pasar_id != null ? `id:${r.pasar_id}` : r.pasar_nama || "")),
  );
  const sudah = set.size;
  return {
    sudah: Math.min(sudah, assignedTotal),
    total: assignedTotal,
    tanggal,
  };
}

export async function yesterdayBarisForUser(diinput_oleh, tanggalKemarin) {
  const rows = await HargaPangan.findAll({
    where: {
      diinput_oleh,
      tanggal: tanggalKemarin,
      status: { [Op.in]: [STATUS.MENUNGGU, STATUS.TERVERIFIKASI] },
    },
    raw: true,
  });
  return rows.map((r) => ({
    komoditas_key: r.komoditas_key,
    nama: r.komoditas_nama,
    harga_eceran: Number(r.harga_eceran),
    satuan: r.satuan,
  }));
}

/** Alert dashboard: baris anomali yang masih relevan untuk tindak lanjut */
export async function listRecentAnomalyRows({ limit = 50 } = {}) {
  return HargaPangan.findAll({
    where: {
      is_anomaly: true,
      status: { [Op.in]: [STATUS.MENUNGGU, STATUS.TERVERIFIKASI] },
    },
    order: [
      ["tanggal", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    raw: true,
  });
}

export { STATUS as HARGA_PANGAN_STATUS };
