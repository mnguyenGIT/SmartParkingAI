import { useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { getTrafficReport, askAdmin, getStaffingSuggestion } from "../../api/ai";

export default function ReportsPage() {
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficReport, setTrafficReport] = useState(null);

  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [answer, setAnswer] = useState(null);

  const [soNhanVien, setSoNhanVien] = useState(2);
  const [staffingLoading, setStaffingLoading] = useState(false);
  const [staffingResult, setStaffingResult] = useState(null);

  async function handleTrafficReport() {
    setTrafficLoading(true);
    setTrafficReport(null);
    try {
      const data = await getTrafficReport(7);
      setTrafficReport(data);
    } catch (err) {
      setTrafficReport({ summary: "Lỗi khi lấy báo cáo.", data: [] });
    } finally {
      setTrafficLoading(false);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setAskLoading(true);
    setAnswer(null);
    try {
      const data = await askAdmin(question, 7);
      setAnswer(data);
    } catch (err) {
      setAnswer({ answer: "Lỗi khi hỏi AI.", data_used: {} });
    } finally {
      setAskLoading(false);
    }
  }

  async function handleStaffing() {
    setStaffingLoading(true);
    setStaffingResult(null);
    try {
      const data = await getStaffingSuggestion(Number(soNhanVien), 7);
      setStaffingResult(data);
    } catch (err) {
      setStaffingResult({ suggestion: "Lỗi khi lấy gợi ý.", data: [] });
    } finally {
      setStaffingLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Báo cáo & Trợ lý AI</Heading>
      </div>

      {/* AI-01: Báo cáo lưu lượng */}
      <article className="panel ai-card">
        <div className="ai-glow" />
        <div className="ai-head">
          <div className="ai-icon"><Icon name="sparkles" /></div>
          <span>SMARTPARKING AI</span>
        </div>
        <Heading level={2}>AI-01 — Báo cáo lưu lượng (7 ngày gần nhất)</Heading>
        <Button onClick={handleTrafficReport} disabled={trafficLoading}>
          {trafficLoading ? "Đang phân tích..." : "Sinh báo cáo"}
        </Button>

        {trafficReport && (
          <div style={{ marginTop: "16px" }}>
            <p className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              {trafficReport.summary}
            </p>
            {trafficReport.data.length > 0 && (
              <div className="table-wrap" style={{ marginTop: "12px" }}>
                <table>
                  <thead>
                    <tr><th>Ngày</th><th>Số lượt</th><th>Doanh thu</th></tr>
                  </thead>
                  <tbody>
                    {trafficReport.data.map((row, i) => (
                      <tr key={i}>
                        <td>{row.ngay}</td>
                        <td>{row.so_luot}</td>
                        <td>{Number(row.doanh_thu).toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </article>

      {/* AI-02: Hỏi đáp quản trị */}
      <article className="panel" style={{ marginTop: "13px" }}>
        <Heading level={2}>AI-02 — Hỏi đáp quản trị</Heading>
        <form onSubmit={handleAsk} className="flex gap-3 mb-4">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="VD: Khung giờ nào đông nhất?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" disabled={askLoading}>
            {askLoading ? "Đang hỏi..." : "Hỏi AI"}
          </Button>
        </form>
        {answer && (
          <p className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            {answer.answer}
          </p>
        )}
      </article>

      {/* AI-03: Gợi ý nhân sự */}
      <article className="panel" style={{ marginTop: "13px" }}>
        <Heading level={2}>AI-03 — Gợi ý bố trí nhân sự</Heading>
        <div className="flex gap-3 items-end mb-4">
          <div>
            <label className="block text-sm mb-1">Số nhân viên hiện có</label>
            <input
              type="number"
              min="1"
              className="border rounded px-3 py-2 w-32"
              value={soNhanVien}
              onChange={(e) => setSoNhanVien(e.target.value)}
            />
          </div>
          <Button onClick={handleStaffing} disabled={staffingLoading}>
            {staffingLoading ? "Đang phân tích..." : "Xin gợi ý"}
          </Button>
        </div>
        {staffingResult && (
          <p className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            {staffingResult.suggestion}
          </p>
        )}
      </article>
    </>
  );
}
