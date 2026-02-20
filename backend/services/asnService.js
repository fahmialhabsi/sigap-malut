import ASN from "../models/SEK-KEP.js";

export async function getAllASN() {
  return await ASN.findAll();
}

export async function getASNById(id) {
  return await ASN.findByPk(id);
}

export async function createASN(data) {
  return await ASN.create(data);
}

export async function updateASN(id, data) {
  return await ASN.update(data, { where: { id } });
}

export async function deleteASN(id) {
  return await ASN.destroy({ where: { id } });
}
