import client from "./client";

export async function checkIn(bien_so, loai_xe_id, khu_vuc_id = null) {
  const res = await client.post("/sessions/check-in", {
    bien_so,
    loai_xe_id,
    khu_vuc_id,
  });
  return res.data;
}

export async function checkOut(sessionId) {
  const res = await client.post(`/sessions/${sessionId}/check-out`);
  return res.data;
}

export async function listSessions(params = {}) {
  const res = await client.get("/sessions", { params });
  return res.data;
}