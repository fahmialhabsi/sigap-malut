import api from "../../utils/api";

export function fetchList() {
  return api.get("/BDS-LAP");
}
export function fetchDetail(id) {
  return api.get("/BDS-LAP/" + id);
}
export function createItem(data) {
  return api.post("/BDS-LAP", data);
}
export function updateItem(id, data) {
  return api.put("/BDS-LAP/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/BDS-LAP/" + id);
}
