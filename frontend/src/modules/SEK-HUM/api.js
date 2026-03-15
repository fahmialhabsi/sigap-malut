import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-HUM");
}
export function fetchDetail(id) {
  return api.get("/SEK-HUM/" + id);
}
export function createItem(data) {
  return api.post("/SEK-HUM", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-HUM/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-HUM/" + id);
}
