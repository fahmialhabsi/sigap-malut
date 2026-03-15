import api from "../../utils/api";

export function fetchList() {
  return api.get("/UPT-ADM");
}
export function fetchDetail(id) {
  return api.get("/UPT-ADM/" + id);
}
export function createItem(data) {
  return api.post("/UPT-ADM", data);
}
export function updateItem(id, data) {
  return api.put("/UPT-ADM/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/UPT-ADM/" + id);
}
