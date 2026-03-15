import api from "../../utils/api";

export function fetchList() {
  return api.get("/BDS-MON");
}
export function fetchDetail(id) {
  return api.get("/BDS-MON/" + id);
}
export function createItem(data) {
  return api.post("/BDS-MON", data);
}
export function updateItem(id, data) {
  return api.put("/BDS-MON/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BDS-MON/" + id);
}
