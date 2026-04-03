import api from "./api";

export const coordinationService = {
  listInbox(params = {}) {
    return api.get("/coordination/inbox", { params });
  },
  listOutbox(params = {}) {
    return api.get("/coordination/outbox", { params });
  },
  create(payload) {
    return api.post("/coordination", payload);
  },
  respond(id, payload) {
    return api.post(`/coordination/${id}/respond`, payload);
  },
  close(id, payload = {}) {
    return api.post(`/coordination/${id}/close`, payload);
  },
};

export default coordinationService;
