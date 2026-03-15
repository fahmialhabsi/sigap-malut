import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKT-MEV");
}
export function fetchDetail(id) {
  return api.get("/BKT-MEV/" + id);
}
export function createItem(data) {
  return api.post("/BKT-MEV", data);
}
export function updateItem(id, data) {
  return api.put("/BKT-MEV/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKT-MEV/" + id);
}
