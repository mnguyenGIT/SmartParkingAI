import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === "admin") {
        navigate("/quanly/dashboard");
      } else {
        navigate("/nhanvien");
      }
    } catch (err) {
      setError("Sai tên đăng nhập hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <form onSubmit={handleSubmit} className="w-96">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "var(--accent)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              <span>P</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-1">SmartParkingAI</h1>
          <p className="text-sm color-muted">Hệ thống quản lý bãi đỗ xe có tích hợp AI</p>
        </div>

        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input
            className="w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="admin / nhanvien"
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full button button-primary"
          style={{ marginTop: "8px" }}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="text-center mt-6" style={{ fontSize: "11px", color: "#89918b" }}>
          <p>Tài khoản mẫu:</p>
          <p>admin / Admin@123 | nhanvien / NhanVien@123</p>
        </div>
      </form>
    </div>
  );
}
