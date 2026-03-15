import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKT-FSL");
}
export function fetchDetail(id) {
  return api.get("/BKT-FSL/" + id);
}
export function createItem(data) {
  return api.post("/BKT-FSL", data);
}
export function updateItem(id, data) {
  return api.put("/BKT-FSL/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKT-FSL/" + id);
}
