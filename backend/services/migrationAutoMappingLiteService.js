/**
 * Auto-mapping minimal: kode sama (dalam jalur prog+keg) → approved;
 * nama sub sama (dalam jalur) → approved; lainnya → pending.
 */

import { Op } from "sequelize";
import sequelize from "../config/database.js";
import MasterProgram from "../models/MasterProgram.js";
import MasterKegiatan from "../models/MasterKegiatan.js";
import MasterSubKegiatan from "../models/MasterSubKegiatan.js";
import MappingSubKegiatan from "../models/MappingSubKegiatan.js";

function normName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function loadEnrichedSubs(regulasiVersiId) {
  const subs = await MasterSubKegiatan.findAll({
    where: { regulasi_versi_id: regulasiVersiId },
    raw: true,
  });
  if (subs.length === 0) return [];

  const kegIds = [...new Set(subs.map((s) => s.master_kegiatan_id))];
  const kegs = await MasterKegiatan.findAll({
    where: { id: { [Op.in]: kegIds } },
    raw: true,
  });
  const kegMap = Object.fromEntries(kegs.map((k) => [k.id, k]));

  const progIds = [...new Set(kegs.map((k) => k.master_program_id))];
  const progs = await MasterProgram.findAll({
    where: { id: { [Op.in]: progIds } },
    raw: true,
  });
  const progMap = Object.fromEntries(progs.map((p) => [p.id, p]));

  return subs.map((sub) => {
    const keg = kegMap[sub.master_kegiatan_id];
    const prog = keg ? progMap[keg.master_program_id] : null;
    return { sub, keg, prog };
  });
}

function findMatchByCode(oldE, newEnriched) {
  for (const n of newEnriched) {
    if (!oldE.prog || !oldE.keg || !n.prog || !n.keg) continue;
    if (oldE.prog.kode === n.prog.kode && oldE.keg.kode === n.keg.kode && oldE.sub.kode === n.sub.kode) {
      return { newSub: n.sub, reason: "EXACT_CODE_LITE" };
    }
  }
  return null;
}

function findMatchByName(oldE, newEnriched) {
  const on = normName(oldE.sub.nama);
  if (!on) return null;
  for (const n of newEnriched) {
    if (!oldE.prog || !oldE.keg || !n.prog || !n.keg) continue;
    if (oldE.prog.kode !== n.prog.kode || oldE.keg.kode !== n.keg.kode) continue;
    if (normName(n.sub.nama) === on) {
      return { newSub: n.sub, reason: "EXACT_NAME_LITE" };
    }
  }
  return null;
}

/**
 * @returns {{ created: number, updated: number, results: object[] }}
 */
export async function runAutoMappingLite({ regulasiVersiFromId, regulasiVersiToId }) {
  if (regulasiVersiFromId === regulasiVersiToId) {
    const err = new Error("Versi asal dan tujuan harus berbeda");
    err.statusCode = 400;
    err.code = "INVALID_VERSION_PAIR";
    err.field = "regulasi_versi_to_id";
    throw err;
  }

  const oldEnriched = await loadEnrichedSubs(regulasiVersiFromId);
  const newEnriched = await loadEnrichedSubs(regulasiVersiToId);

  let created = 0;
  let updated = 0;
  const results = [];

  await sequelize.transaction(async (transaction) => {
    for (const oldE of oldEnriched) {
      const old = oldE.sub;
      let match = findMatchByCode(oldE, newEnriched);
      let status = "pending";
      let newSubId = null;
      let matchReason = "NO_MATCH_LITE";
      let confidence = 0;

      if (match) {
        status = "approved";
        newSubId = match.newSub.id;
        matchReason = match.reason;
        confidence = 1;
      } else {
        match = findMatchByName(oldE, newEnriched);
        if (match) {
          status = "approved";
          newSubId = match.newSub.id;
          matchReason = match.reason;
          confidence = 1;
        }
      }

      const newKode = newSubId ? newEnriched.find((x) => x.sub.id === newSubId)?.sub.kode : null;
      const newNama = newSubId ? newEnriched.find((x) => x.sub.id === newSubId)?.sub.nama : null;

      const [row, wasCreated] = await MappingSubKegiatan.findOrCreate({
        where: {
          regulasi_versi_from_id: regulasiVersiFromId,
          regulasi_versi_to_id: regulasiVersiToId,
          old_master_sub_kegiatan_id: old.id,
        },
        defaults: {
          new_master_sub_kegiatan_id: newSubId,
          old_kode: old.kode,
          new_kode: newKode,
          old_nama: old.nama,
          new_nama: newNama,
          confidence_score: confidence,
          mapping_type: "auto",
          status,
          match_reason: matchReason,
        },
        transaction,
      });

      if (wasCreated) {
        created += 1;
        results.push({
          mapping_id: row.id,
          old_master_sub_kegiatan_id: old.id,
          new_master_sub_kegiatan_id: newSubId,
          status,
          match_reason: matchReason,
          action: "created",
        });
      } else {
        if (row.status === "approved" && row.new_master_sub_kegiatan_id && status === "pending") {
          results.push({
            mapping_id: row.id,
            old_master_sub_kegiatan_id: old.id,
            new_master_sub_kegiatan_id: row.new_master_sub_kegiatan_id,
            status: row.status,
            match_reason: row.match_reason,
            action: "skipped_existing_approved",
          });
          continue;
        }

        if (
          row.status === "approved" &&
          newSubId &&
          row.new_master_sub_kegiatan_id === newSubId &&
          row.match_reason === matchReason
        ) {
          results.push({
            mapping_id: row.id,
            old_master_sub_kegiatan_id: old.id,
            new_master_sub_kegiatan_id: newSubId,
            status,
            match_reason: matchReason,
            action: "unchanged",
          });
          continue;
        }

        await row.update(
          {
            new_master_sub_kegiatan_id: newSubId,
            old_kode: old.kode,
            new_kode: newKode,
            old_nama: old.nama,
            new_nama: newNama,
            confidence_score: confidence,
            mapping_type: "auto",
            status,
            match_reason: matchReason,
          },
          { transaction },
        );
        updated += 1;
        results.push({
          mapping_id: row.id,
          old_master_sub_kegiatan_id: old.id,
          new_master_sub_kegiatan_id: newSubId,
          status,
          match_reason: matchReason,
          action: "updated",
        });
      }
    }
  });

  return {
    regulasi_versi_from_id: regulasiVersiFromId,
    regulasi_versi_to_id: regulasiVersiToId,
    old_sub_count: oldEnriched.length,
    new_sub_count: newEnriched.length,
    created,
    updated,
    results,
  };
}
