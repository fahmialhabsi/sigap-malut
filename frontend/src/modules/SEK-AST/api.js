import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-AST");
}
export function fetchDetail(id) {
  return api.get("/SEK-AST/" + id);
}
export function createItem(data) {
  return api.post("/SEK-AST", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-AST/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-AST/" + id);
}
