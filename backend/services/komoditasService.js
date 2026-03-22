import Komoditas from "../models/komoditas.js";
import { triggerAfterKomoditasUpdate } from "./autoUpdateService.js";

export async function getAllKomoditas() {
  return await Komoditas.findAll({ where: { is_deleted: false } });
}

export async function getKomoditasById(id) {
  return await Komoditas.findOne({ where: { id, is_deleted: false } });
}

export async function createKomoditas(data) {
  return await Komoditas.create(data);
}

export async function updateKomoditas(id, data) {
  const [affectedRows] = await Komoditas.update(data, {
    where: { id, is_deleted: false },
    returning: true,
  });
  if (affectedRows) {
    const updated = await Komoditas.findByPk(id);
    await triggerAfterKomoditasUpdate(updated, {});
  }
  return affectedRows;
}

/**
 * Soft delete — menandai is_deleted=true, tidak menghapus data dari DB.
 * @param {number|string} id - primary key record
 * @param {number|null} deletedBy - ID user yang menghapus (opsional)
 */
export async function deleteKomoditas(id, deletedBy = null) {
  return await Komoditas.update(
    { is_deleted: true, deleted_at: new Date(), deleted_by: deletedBy },
    { where: { id, is_deleted: false } },
  );
}
