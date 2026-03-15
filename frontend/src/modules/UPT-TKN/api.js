import api from "../../utils/api";

export function fetchList() {
  return api.get("/UPT-TKN");
}
export function fetchDetail(id) {
  return api.get("/UPT-TKN/" + id);
}
export function createItem(data) {
  // Deteksi jika ada file (File instance) di data
  const hasFile = Object.values(data).some(
    (v) => v instanceof File || (Array.isArray(v) && v[0] instanceof File),
  );
  if (hasFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value) && value[0] instanceof File) {
        value.forEach((file, idx) => formData.append(`${key}[${idx}]`, file));
      } else {
        formData.append(key, value ?? "");
      }
    });
    return api.post("/UPT-TKN", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return api.post("/UPT-TKN", data);
  }
}
export function updateItem(id, data) {
  return api.put("/UPT-TKN/" + id, data);
}
export function deleteItem(id) {
  return api.delete("/UPT-TKN/" + id);
}
