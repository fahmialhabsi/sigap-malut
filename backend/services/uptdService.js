import UPTD from "../models/UPT-ADM.js";

export async function getAllUPTD() {
  return await UPTD.findAll();
}

export async function getUPTDById(id) {
  return await UPTD.findByPk(id);
}

export async function createUPTD(data) {
  return await UPTD.create(data);
}

export async function updateUPTD(id, data) {
  return await UPTD.update(data, { where: { id } });
}

export async function deleteUPTD(id) {
  return await UPTD.destroy({ where: { id } });
}
