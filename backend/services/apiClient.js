// Mock backend/services/apiClient.js
export async function get(url) {
  // Simulasi response endpoint
  return {
    status: 200,
    data: { buffer: Buffer.from("mock data"), id: 1, updated_at: new Date() },
  };
}

export async function post(url, body) {
  // Simulasi response workflow
  return {
    status: 200,
    data: { state: body.state || "pending", id: 1 },
  };
}

export default { get, post };
