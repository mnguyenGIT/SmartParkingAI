import client from "./client";

export async function listPricing() {
  const res = await client.get("/pricing");
  return res.data;
}

export async function createPricing(payload) {
  const res = await client.post("/pricing", payload);
  return res.data;
}
