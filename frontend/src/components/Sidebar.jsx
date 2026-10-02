import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import Button from "./Button";

const navItems = [
  { label: "Tổng quan", icon: "grid", path: "/quanly/dashboard" },
  { label: "Bãi đỗ xe", icon: "parking", path: "/quanly/zones" },
  { label: "Vị trí đỗ", icon: "parking", path: "/quanly/parking-spots" },
  { label: "Loại xe", icon: "car", path: "/quanly/vehicle-types" },
  { label: "Bảng giá", icon: "chart", path: "/quanly/pricing" },
  { label: "Lượt gửi xe", icon: "car", path: "/quanly/sessions" },
  { label: "Khách hàng V/tháng", icon: "users", path: "/quanly/monthly-customers" },
  { label: "Báo cáo AI", icon: "sparkles", path: "/quanly/reports" },
];

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span>P</span>
        </div>
        <div>
          <strong>SmartParking</strong>
          <small>AI management</small>
        </div>
      </div>

      <nav className="nav-list" aria-label="Điều hướng chính">
        <span className="nav-label">QUẢN LÝ</span>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`.trim()
            }
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.label === "Báo cáo AI" && <i>Mới</i>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <Button
          variant="ghost"
          className="nav-item"
          onClick={onLogout}
        >
          <Icon name="more" size={18} />
          <span>Đăng xuất</span>
        </Button>
        <div className="profile">
          <div className="avatar">{user?.full_name?.slice(0, 2).toUpperCase() || "AD"}</div>
          <div>
            <strong>{user?.full_name || "Quản lý"}</strong>
            <small>{user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
