import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-DVR");
}
export function fetchDetail(id) {
  return api.get("/BKS-DVR/" + id);
}
export function createItem(data) {
  return api.post("/BKS-DVR", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-DVR/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-DVR/" + id);
}
