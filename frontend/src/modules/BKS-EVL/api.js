import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-EVL");
}
export function fetchDetail(id) {
  return api.get("/BKS-EVL/" + id);
}
export function createItem(data) {
  return api.post("/BKS-EVL", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-EVL/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-EVL/" + id);
}
