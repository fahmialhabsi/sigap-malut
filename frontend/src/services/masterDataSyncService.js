import api from "../services/apiClient";

export async function triggerMasterDataSync() {
  return api.post("/master-data-sync/trigger");
}

export async function syncMasterDataOnce() {
  return api.post("/master-data-sync/sync-once");
}

export async function getSyncStats(unit = "master-data") {
  const res = await api.get(`/master-data-sync/stats?unit=${unit}`);
  return res.data.stats;
}
