import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-LAP");
}
export function fetchDetail(id) {
  return api.get("/BKS-LAP/" + id);
}
export function createItem(data) {
  return api.post("/BKS-LAP", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-LAP/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-LAP/" + id);
}
