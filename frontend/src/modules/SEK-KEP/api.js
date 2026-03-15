import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-KEP");
}
export function fetchDetail(id) {
  return api.get("/SEK-KEP/" + id);
}
export function createItem(data) {
  return api.post("/SEK-KEP", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-KEP/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-KEP/" + id);
}
