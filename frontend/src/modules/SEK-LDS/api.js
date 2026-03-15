import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-LDS");
}
export function fetchDetail(id) {
  return api.get("/SEK-LDS/" + id);
}
export function createItem(data) {
  return api.post("/SEK-LDS", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-LDS/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-LDS/" + id);
}
