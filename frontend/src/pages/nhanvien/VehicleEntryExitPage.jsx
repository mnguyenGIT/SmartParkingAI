import { useEffect, useState } from "react";
import { checkIn, checkOut, listSessions } from "../../api/sessions";
import { listVehicleTypes } from "../../api/vehicleTypes";
import { useAuth } from "../../context/AuthContext";

export default function VehicleEntryExitPage() {
  const { user, logout } = useAuth();
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [bienSo, setBienSo] = useState("");
  const [loaiXeId, setLoaiXeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  async function loadSessions() {
    const data = await listSessions({ trang_thai: "dang_gui" });
    setSessions(data);
  }

  useEffect(() => {
    listVehicleTypes().then((types) => {
      setVehicleTypes(types);
      if (types.length > 0) setLoaiXeId(types[0].id);
    });
    loadSessions();
  }, []);

  async function handleCheckIn(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await checkIn(bienSo, Number(loaiXeId));
      setMessage(`Ghi nhận thành công — mã vé ${result.ma_ve}, vị trí #${result.vi_tri_id}`);
      setBienSo("");
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra");
    }
  }

  async function handleCheckOut(sessionId) {
    setError("");
    setMessage("");
    try {
      const result = await checkOut(sessionId);
      setMessage(`Xe ra thành công — số tiền: ${Number(result.so_tien).toLocaleString()}đ`);
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SmartParkingAI — Nhân viên</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.full_name}</span>
          <button onClick={logout} className="text-sm text-red-600">Đăng xuất</button>
        </div>
      </div>

      {message && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Ghi nhận xe vào</h2>
        <form onSubmit={handleCheckIn} className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-sm mb-1">Biển số xe</label>
            <input
              className="border rounded px-3 py-2"
              value={bienSo}
              onChange={(e) => setBienSo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Loại xe</label>
            <select className="border rounded px-3 py-2" value={loaiXeId} onChange={(e) => setLoaiXeId(e.target.value)}>
              {vehicleTypes.map((vt) => (
                <option key={vt.id} value={vt.id}>{vt.ten_loai}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ghi nhận xe vào
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Xe đang gửi ({sessions.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Mã vé</th>
              <th>Biển số</th>
              <th>Vị trí</th>
              <th>Giờ vào</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.ma_ve}</td>
                <td>{s.bien_so}</td>
                <td>#{s.vi_tri_id}</td>
                <td>{new Date(s.thoi_gian_vao).toLocaleTimeString()}</td>
                <td>
                  <button
                    onClick={() => handleCheckOut(s.id)}
                    className="text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    Ghi nhận xe ra
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}