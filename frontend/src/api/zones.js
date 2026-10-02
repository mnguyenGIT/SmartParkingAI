import client from "./client";

export async function listZones() {
  const res = await client.get("/zones");
  return res.data;
}

export async function createZone(payload) {
  const res = await client.post("/zones", payload);
  return res.data;
}

export async function updateZone(zoneId, payload) {
  const res = await client.patch(`/zones/${zoneId}`, payload);
  return res.data;
}

export async function deactivateZone(zoneId) {
  const res = await client.patch(`/zones/${zoneId}/deactivate`);
  return res.data;
}
