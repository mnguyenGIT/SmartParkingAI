import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { listSessions } from "../../api/sessions";
import { listVehicleTypes } from "../../api/vehicleTypes";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchPlate, setSearchPlate] = useState("");

  useEffect(() => {
    Promise.all([listSessions().then(setSessions), listVehicleTypes().then(setVehicleTypes)])
      .catch(() => { setSessions([]); setVehicleTypes([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = sessions;
    if (filterStatus !== "all") {
      result = result.filter((s) => s.trang_thai === filterStatus);
    }
    if (searchPlate.trim()) {
      result = result.filter((s) => s.bien_so.toLowerCase().includes(searchPlate.toLowerCase()));
    }
    setFiltered(result);
  }, [sessions, filterStatus, searchPlate]);

  const getStatusBadge = (status) => {
    const map = {
      dang_gui: { label: "Đang gửi", color: "active" },
      da_ra: { label: "Đã ra", color: "inactive" },
      su_co: { label: "Sự cố", color: "inactive" },
    };
    const m = map[status] || { label: status, color: "inactive" };
    return <span className={`status-badge ${m.color}`}>{m.label}</span>;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Lịch sử lượt gửi xe</Heading>
      </div>

      <div className="flex gap-3 items-end mb-4 flex-wrap">
        <div>
          <label className="block text-sm mb-1">Tìm biển số</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-48"
            placeholder="Nhập biển số..."
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Trạng thái</label>
          <select
            className="border rounded px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="dang_gui">Đang gửi</option>
            <option value="da_ra">Đã ra</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Vị trí</th>
                <th>Vào</th>
                <th>Ra</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-sm text-gray-500">
                    Không tìm thấy lượt gửi nào
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const vt = vehicleTypes.find((v) => v.id === s.loai_xe_id);
                  return (
                    <tr key={s.id}>
                      <td>{s.ma_ve}</td>
                      <td>{s.bien_so}</td>
                      <td>{vt?.ten_loai || s.loai_xe_id}</td>
                      <td>#{s.vi_tri_id}</td>
                      <td>{new Date(s.thoi_gian_vao).toLocaleString("vi-VN")}</td>
                      <td>{s.thoi_gian_ra ? new Date(s.thoi_gian_ra).toLocaleString("vi-VN") : "-"}</td>
                      <td>{s.so_tien ? Number(s.so_tien).toLocaleString() + "đ" : "-"}</td>
                      <td>{getStatusBadge(s.trang_thai)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
