import client from "./client";

export async function listMonthlyCustomers() {
  const res = await client.get("/monthly-customers");
  return res.data;
}

export async function createMonthlyCustomer(payload) {
  const res = await client.post("/monthly-customers", payload);
  return res.data;
}
