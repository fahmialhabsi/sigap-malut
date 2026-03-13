import api from "./apiClient";

export async function generateModule(modulData) {
  const response = await api.post("/module-generator/generate", modulData);
  return response.data;
}

export async function fetchDynamicModules() {
  const response = await api.get("/module-generator/list");
  return response.data;
}
