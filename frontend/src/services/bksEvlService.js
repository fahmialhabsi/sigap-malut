// frontend/src/services/bksEvlService.js

import api from "./api";

export async function fetchBksEvlSummary() {
  const r = await api.get("/bks-evl/summary");
  return r.data?.data;
}
