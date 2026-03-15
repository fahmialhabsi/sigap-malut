import api from "../../utils/api";

export function fetchList() {
  return api.get("/SEK-ADM");
}
export function fetchDetail(id) {
  return api.get("/SEK-ADM/" + id);
}
export function createItem(data) {
  return api.post("/SEK-ADM", data);
}
export function updateItem(id, data) {
  return api.put("/SEK-ADM/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/SEK-ADM/" + id);
}
