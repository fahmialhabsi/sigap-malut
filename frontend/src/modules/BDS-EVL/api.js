import api from "../../utils/api";

export function fetchList() {
  return api.get("/BDS-EVL");
}
export function fetchDetail(id) {
  return api.get("/BDS-EVL/" + id);
}
export function createItem(data) {
  return api.post("/BDS-EVL", data);
}
export function updateItem(id, data) {
  return api.put("/BDS-EVL/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BDS-EVL/" + id);
}
