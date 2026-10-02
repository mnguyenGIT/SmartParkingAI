import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}</span>
            <h1>Chào {user?.full_name || "Quản lý"}</h1>
          </div>
          <div className="top-actions">
            <span className="text-sm text-gray-500">{user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}</span>
          </div>
        </header>
        <div style={{ paddingTop: "24px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
