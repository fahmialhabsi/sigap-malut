export async function generateModule(modulData, token) {
  const resp = await fetch("/api/modules/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(modulData),
  });
  return await resp.json();
}

export async function fetchDynamicModules(token) {
  const resp = await fetch("/api/modules/list", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await resp.json();
}
