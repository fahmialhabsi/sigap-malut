import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-KEU");
}
export function fetchDetail(id) {
  return api.get("/SEK-KEU/" + id);
}
export function createItem(data) {
  return api.post("/SEK-KEU", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-KEU/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-KEU/" + id);
}
