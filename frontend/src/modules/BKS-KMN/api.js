import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-KMN");
}
export function fetchDetail(id) {
  return api.get("/BKS-KMN/" + id);
}
export function createItem(data) {
  return api.post("/BKS-KMN", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-KMN/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-KMN/" + id);
}
