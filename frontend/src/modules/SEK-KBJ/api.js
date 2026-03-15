import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-KBJ");
}
export function fetchDetail(id) {
  return api.get("/SEK-KBJ/" + id);
}
export function createItem(data) {
  return api.post("/SEK-KBJ", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-KBJ/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-KBJ/" + id);
}
