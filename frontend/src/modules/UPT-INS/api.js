import api from "../../utils/api";

export function fetchList() {
  return api.get("/UPT-INS");
}
export function fetchDetail(id) {
  return api.get("/UPT-INS/" + id);
}
export function createItem(data) {
  return api.post("/UPT-INS", data);
}
export function updateItem(id, data) {
  return api.put("/UPT-INS/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/UPT-INS/" + id);
}
