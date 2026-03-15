import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-BMB");
}
export function fetchDetail(id) {
  return api.get("/BKS-BMB/" + id);
}
export function createItem(data) {
  return api.post("/BKS-BMB", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-BMB/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-BMB/" + id);
}
