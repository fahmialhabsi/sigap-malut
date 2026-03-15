import api from "../../utils/api";

export function fetchList() {
  return api.get("/BKS-KBJ");
}
export function fetchDetail(id) {
  return api.get("/BKS-KBJ/" + id);
}
export function createItem(data) {
  return api.post("/BKS-KBJ", data);
}
export function updateItem(id, data) {
  return api.put("/BKS-KBJ/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BKS-KBJ/" + id);
}
