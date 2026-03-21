// services/commentService.js
import api from "./apiClient";

export async function addCommentAPI({ user, modulId, dataId, komentar }) {
  return api.post("/comment", { user, modulId, dataId, komentar });
}

export async function getCommentsAPI({ modulId, dataId }) {
  return api.get(`/comment?modulId=${modulId}&dataId=${dataId}`);
}

export async function getAllCommentsAPI() {
  return api.get("/comment");
}
