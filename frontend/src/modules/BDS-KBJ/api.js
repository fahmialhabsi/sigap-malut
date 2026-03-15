import api from "../../utils/api";

export function fetchList() {
  return api.get("/BDS-KBJ");
}
export function fetchDetail(id) {
  return api.get("/BDS-KBJ/" + id);
}
export function createItem(data) {
  return api.post("/BDS-KBJ", data);
}
export function updateItem(id, data) {
  return api.put("/BDS-KBJ/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BDS-KBJ/" + id);
}
