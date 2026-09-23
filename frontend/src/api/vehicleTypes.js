import client from "./client";

export async function listVehicleTypes() {
  const res = await client.get("/vehicle-types");
  return res.data;
}