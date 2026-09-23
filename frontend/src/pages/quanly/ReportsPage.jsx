import { useState } from "react";
import { getTrafficReport, askAdmin, getStaffingSuggestion } from "../../api/ai";
import { useAuth } from "../../context/AuthContext";

export default function ReportsPage() {
  const { user, logout } = useAuth();

  // AI-01
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficReport, setTrafficReport] = useState(null);

  // AI-02
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [answer, setAnswer] = useState(null);

  // AI-03
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SmartParkingAI — Quản lý</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.full_name}</span>
          <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
        </div>
      </div>

      {/* AI-01: Báo cáo lưu lượng */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">AI-01 — Báo cáo lưu lượng (7 ngày gần nhất)</h2>
          <button
            onClick={handleTrafficReport}
            disabled={trafficLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {trafficLoading ? "Đang phân tích..." : "Sinh báo cáo"}
          </button>
        </div>

        {trafficReport && (
          <div>
            <p className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm">
              {trafficReport.summary}
            </p>
            {trafficReport.data.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-1">Ngày</th>
                    <th>Số lượt</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficReport.data.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1">{row.ngay}</td>
                      <td>{row.so_luot}</td>
                      <td>{Number(row.doanh_thu).toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* AI-02: Hỏi đáp quản trị */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">AI-02 — Hỏi đáp quản trị</h2>
        <form onSubmit={handleAsk} className="flex gap-3 mb-4">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="VD: Khung giờ nào đông nhất?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={askLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {askLoading ? "Đang hỏi..." : "Hỏi AI"}
          </button>
        </form>
        {answer && (
          <p className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            {answer.answer}
          </p>
        )}
      </div>

      {/* AI-03: Gợi ý nhân sự */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">AI-03 — Gợi ý bố trí nhân sự</h2>
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
          <button
            onClick={handleStaffing}
            disabled={staffingLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {staffingLoading ? "Đang phân tích..." : "Xin gợi ý"}
          </button>
        </div>
        {staffingResult && (
          <p className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            {staffingResult.suggestion}
          </p>
        )}
      </div>
    </div>
  );
}