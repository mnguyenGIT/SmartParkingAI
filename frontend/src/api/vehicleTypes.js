import client from "./client";

export async function listVehicleTypes() {
  const res = await client.get("/vehicle-types");
  return res.data;
}

export async function createVehicleType(payload) {
  const res = await client.post("/vehicle-types", payload);
  return res.data;
}

export async function updateVehicleType(vtypeId, payload) {
  const res = await client.patch(`/vehicle-types/${vtypeId}`, payload);
  return res.data;
}

export async function deactivateVehicleType(vtypeId) {
  const res = await client.patch(`/vehicle-types/${vtypeId}/deactivate`);
  return res.data;
}
