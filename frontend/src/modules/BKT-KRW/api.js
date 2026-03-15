import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKT-KRW");
}
export function fetchDetail(id) {
  return api.get("/BKT-KRW/" + id);
}
export function createItem(data) {
  return api.post("/BKT-KRW", data);
}
export function updateItem(id, data) {
  return api.put("/BKT-KRW/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKT-KRW/" + id);
}
