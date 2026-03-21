import api from "../services/apiClient";

export async function getIntegrationLogs({
  unit,
  status,
  page = 1,
  limit = 20,
} = {}) {
  const params = [];
  if (unit) params.push(`unit=${unit}`);
  if (status) params.push(`status=${status}`);
  params.push(`page=${page}`);
  params.push(`limit=${limit}`);
  const query = params.length ? `?${params.join("&")}` : "";
  const res = await api.get(`/integration-log${query}`);
  return res.data;
}
