/**
 * Validasi governance untuk mapping_sub_kegiatan (approved) dan apply transaksi.
 */

import MappingSubKegiatan from "../models/MappingSubKegiatan.js";

/**
 * Cari old_sub yang punya lebih dari satu baris approved untuk pasangan versi.
 * @returns {Array<{ old_master_sub_kegiatan_id: number, mapping_ids: number[], count: number }>}
 */
export async function findDuplicateApprovedMappings(regulasiVersiFromId, regulasiVersiToId) {
  const rows = await MappingSubKegiatan.findAll({
    where: {
      regulasi_versi_from_id: regulasiVersiFromId,
      regulasi_versi_to_id: regulasiVersiToId,
      status: "approved",
    },
    attributes: ["id", "old_master_sub_kegiatan_id"],
    raw: true,
  });

  const byOld = new Map();
  for (const r of rows) {
    const k = r.old_master_sub_kegiatan_id;
    if (!byOld.has(k)) byOld.set(k, []);
    byOld.get(k).push(r.id);
  }

  const duplicates = [];
  for (const [oldSubId, ids] of byOld) {
    if (ids.length > 1) {
      duplicates.push({
        old_master_sub_kegiatan_id: oldSubId,
        mapping_ids: ids,
        count: ids.length,
      });
    }
  }
  return duplicates;
}

/**
 * @throws {Error} dengan code DUPLICATE_APPROVED_MAPPING jika ada duplikat
 */
export async function assertNoDuplicateApprovedMappings(regulasiVersiFromId, regulasiVersiToId) {
  const dups = await findDuplicateApprovedMappings(regulasiVersiFromId, regulasiVersiToId);
  if (dups.length === 0) return;
  const err = new Error(
    "Terdapat lebih dari satu mapping berstatus approved untuk sub kegiatan lama yang sama. " +
      "Selesaikan duplikat sebelum preview/apply.",
  );
  err.code = "DUPLICATE_APPROVED_MAPPING";
  err.statusCode = 422;
  err.duplicates = dups;
  throw err;
}
