import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-RMH");
}
export function fetchDetail(id) {
  return api.get("/SEK-RMH/" + id);
}
export function createItem(data) {
  return api.post("/SEK-RMH", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-RMH/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-RMH/" + id);
}
