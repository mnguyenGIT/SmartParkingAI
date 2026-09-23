import client from "./client";

export async function getTrafficReport(days = 7) {
  const res = await client.post(`/ai/traffic-report?days=${days}`);
  return res.data;
}

export async function askAdmin(question, days = 7) {
  const res = await client.post(`/ai/ask?days=${days}`, { question });
  return res.data;
}

export async function getStaffingSuggestion(soNhanVienHienCo = 2, days = 7) {
  const res = await client.post(`/ai/staffing-suggestion?days=${days}`, {
    so_nhan_vien_hien_co: soNhanVienHienCo,
  });
  return res.data;
}