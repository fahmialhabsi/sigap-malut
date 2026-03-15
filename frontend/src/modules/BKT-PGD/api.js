import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKT-PGD");
}
export function fetchDetail(id) {
  return api.get("/BKT-PGD/" + id);
}
export function createItem(data) {
  return api.post("/BKT-PGD", data);
}
export function updateItem(id, data) {
  return api.put("/BKT-PGD/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKT-PGD/" + id);
}
