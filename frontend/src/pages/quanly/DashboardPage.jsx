import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { listZones } from "../../api/zones";
import { listSessions } from "../../api/sessions";
import { listVehicleTypes } from "../../api/vehicleTypes";
import { getTrafficReport } from "../../api/ai";

const navItems = [
  { label: "Tổng quan", icon: "grid", path: "/quanly/dashboard" },
  { label: "Bãi đỗ xe", icon: "parking", path: "/quanly/zones" },
  { label: "Loại xe", icon: "car", path: "/quanly/vehicle-types" },
  { label: "Bảng giá", icon: "chart", path: "/quanly/pricing" },
  { label: "Lượt gửi xe", icon: "car", path: "/quanly/sessions" },
  { label: "Khách hàng V/tháng", icon: "users", path: "/quanly/monthly-customers" },
  { label: "Báo cáo AI", icon: "sparkles", path: "/quanly/reports" },
];

export default function DashboardPage() {
  const [zones, setZones] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    Promise.all([
      listZones().then(setZones).catch(() => setZones([])),
      listSessions({ trang_thai: "dang_gui" }).then(setActiveSessions).catch(() => setActiveSessions([])),
      listVehicleTypes().then(setVehicleTypes).catch(() => setVehicleTypes([])),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleTrafficReport() {
    setAiLoading(true);
    try {
      const data = await getTrafficReport(7);
      setAiReport(data);
    } catch (err) {
      setAiReport({ summary: "Không thể lấy báo cáo AI.", data: [] });
    } finally {
      setAiLoading(false);
    }
  }

  const totalSpots = zones.length;
  const activeSessionsCount = activeSessions.length;
  const occupancyPercent = totalSpots > 0 ? Math.round((activeSessionsCount / totalSpots) * 100) : 0;

  return (
    <>
      <section className="dashboard-grid">
        <div>
          <div className="hero-row">
            <div>
              <p className="intro">Tổng quan vận hành bãi xe theo thời gian thực.</p>
              <span className="live">
                <i /> Dữ liệu trực tiếp
              </span>
            </div>
            <div className="period-tabs">
              <Button variant="outline">
                <Icon name="download" size={16} />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon orange">
                <Icon name="car" />
              </div>
              <div className="stat-meta">
                <span>XE ĐANG GỬI</span>
                <b className="positive">
                  <Icon name="trend" size={13} /> {activeSessionsCount}
                </b>
              </div>
              <strong className="stat-value">{activeSessionsCount}</strong>
              <small>{activeSessionsCount} xe đang trong bãi</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon blue">
                <Icon name="parking" />
              </div>
              <div className="stat-meta">
                <span>VỊ TRÍ TRỐNG</span>
                <b className="neutral">{occupancyPercent}%</b>
              </div>
              <strong className="stat-value">{totalSpots - activeSessionsCount}</strong>
              <small>trên tổng {totalSpots} vị trí</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon green">
                <span>₫</span>
              </div>
              <div className="stat-meta">
                <span>LOẠI XE</span>
                <b className="positive">{vehicleTypes.filter(v => v.is_active).length}</b>
              </div>
              <strong className="stat-value">{vehicleTypes.filter(v => v.is_active).length}</strong>
              <small>đang hoạt động</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon purple">
                <Icon name="clock" />
              </div>
              <div className="stat-meta">
                <span>KHU VỰC</span>
                <b className="positive">{zones.length}</b>
              </div>
              <strong className="stat-value">{zones.length}</strong>
              <small>khu vực đang hoạt động</small>
            </article>
          </div>

          <section className="lower-grid" style={{ marginTop: "13px" }}>
            <article className="panel">
              <div className="panel-head">
                <div>
                  <Heading level={2}>Bãi đỗ theo khu vực</Heading>
                  <p>Tình trạng lấp đầy</p>
                </div>
              </div>
              <div className="zone-list" style={{ marginTop: "19px" }}>
                {zones.length === 0 && !loading ? (
                  <p className="text-sm text-gray-500">Chưa có khu vực nào.</p>
                ) : (
                  zones.map((zone, i) => {
                    const zoneType = ["Xe máy", "Ô tô", "Hỗn hợp"][i % 3];
                    const zoneOccupancy = Math.round(Math.random() * 100);
                    const zoneSpots = Math.ceil(totalSpots / Math.max(zones.length, 1));
                    const zonePercent = `${zoneOccupancy}%`;
                    return (
                      <div className="zone-row" key={zone.id}>
                        <div className={`zone-letter zone-${i % 3}`}>{zone.ten_khu_vuc.slice(-1)}</div>
                        <div className="zone-info">
                          <strong>{zone.ten_khu_vuc}</strong>
                          <span>{zoneType}</span>
                          <div className="progress">
                            <span style={{ width: zonePercent }} />
                          </div>
                        </div>
                        <b>{`${zoneSpots} / ${zoneSpots}`}</b>
                      </div>
                    );
                  })
                )}
              </div>
            </article>

            <article className="panel ai-card">
              <div className="ai-glow" />
              <div className="ai-head">
                <div className="ai-icon">
                  <Icon name="sparkles" />
                </div>
                <span>SMARTPARKING AI</span>
              </div>
              <Heading level={2}>Báo cáo lưu lượng AI</Heading>
              <p>
                {aiReport?.summary || "Nhấn nút để sinh báo cáo lưu lượng 7 ngày gần nhất."}
              </p>
              {aiReport?.data && aiReport.data.length > 0 && (
                <div className="ai-chart">
                  {aiReport.data.map((d, i) => (
                    <span
                      key={i}
                      className="hot"
                      style={{ height: `${Math.min((d.so_luot / 5) * 100, 100)}%` }}
                      title={`${d.ngay}: ${d.so_luot} lượt, ${Number(d.doanh_thu).toLocaleString()}đ`}
                    />
                  ))}
                </div>
              )}
              <div className="ai-action">
                <Button
                  variant="ghost"
                  onClick={handleTrafficReport}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Đang phân tích..." : "Sinh báo cáo AI"}
                  <Icon name="arrow" size={17} />
                </Button>
              </div>
            </article>
          </section>

          <article className="panel" style={{ marginTop: "13px" }}>
            <div className="panel-head">
              <div>
                <Heading level={2}>Xe đang gửi</Heading>
                <p>{activeSessionsCount} xe đang trong bãi</p>
              </div>
            </div>
            <div className="table-wrap" style={{ marginTop: "16px" }}>
              <table>
                <thead>
                  <tr>
                    <th>Mã vé</th>
                    <th>Biển số</th>
                    <th>Vị trí</th>
                    <th>Giờ vào</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                        Không có xe nào đang gửi
                      </td>
                    </tr>
                  ) : (
                    activeSessions.slice(0, 8).map((s) => (
                      <tr key={s.id}>
                        <td>{s.ma_ve}</td>
                        <td>{s.bien_so}</td>
                        <td>#{s.vi_tri_id}</td>
                        <td>{new Date(s.thoi_gian_vao).toLocaleTimeString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
