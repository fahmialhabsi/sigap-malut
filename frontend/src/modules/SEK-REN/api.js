import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-REN");
}
export function fetchDetail(id) {
  return api.get("/SEK-REN/" + id);
}
export function createItem(data) {
  return api.post("/SEK-REN", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-REN/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-REN/" + id);
}
