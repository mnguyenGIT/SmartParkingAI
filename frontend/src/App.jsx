import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/quanly/DashboardLayout";
import DashboardPage from "./pages/quanly/DashboardPage";
import ZonesPage from "./pages/quanly/ZonesPage";
import ParkingSpotsPage from "./pages/quanly/ParkingSpotsPage";
import VehicleTypesPage from "./pages/quanly/VehicleTypesPage";
import PricingPage from "./pages/quanly/PricingPage";
import SessionsPage from "./pages/quanly/SessionsPage";
import MonthlyCustomersPage from "./pages/quanly/MonthlyCustomersPage";
import ReportsPage from "./pages/quanly/ReportsPage";
import VehicleEntryExitPage from "./pages/nhanvien/VehicleEntryExitPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/nhanvien" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/quanly"
        element={
          <PrivateRoute>
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="parking-spots" element={<ParkingSpotsPage />} />
        <Route path="vehicle-types" element={<VehicleTypesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="monthly-customers" element={<MonthlyCustomersPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      <Route
        path="/nhanvien"
        element={
          <PrivateRoute>
            <VehicleEntryExitPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
