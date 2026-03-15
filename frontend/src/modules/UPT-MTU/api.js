import api from "../../utils/api";

export function fetchList() {
  return api.get("/UPT-MTU");
}
export function fetchDetail(id) {
  return api.get("/UPT-MTU/" + id);
}
export function createItem(data) {
  return api.post("/UPT-MTU", data);
}
export function updateItem(id, data) {
  return api.put("/UPT-MTU/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/UPT-MTU/" + id);
}
