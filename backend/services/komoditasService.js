import Komoditas from "../models/komoditas.js";
import { triggerAfterKomoditasUpdate } from "./autoUpdateService.js";

export async function getAllKomoditas() {
  return await Komoditas.findAll();
}

export async function getKomoditasById(id) {
  return await Komoditas.findByPk(id);
}

export async function createKomoditas(data) {
  return await Komoditas.create(data);
}

export async function updateKomoditas(id, data) {
  const [affectedRows] = await Komoditas.update(data, {
    where: { id },
    returning: true,
  });
  if (affectedRows) {
    const updated = await Komoditas.findByPk(id);
    await triggerAfterKomoditasUpdate(updated, {});
  }
  return affectedRows;
}

export async function deleteKomoditas(id) {
  return await Komoditas.destroy({ where: { id } });
}
