import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AccountLayout from "./pages/account/AccountLayout";
import AppointmentsPage from "./pages/account/AppointmentsPage";
import PaymentsPage from "./pages/account/PaymentsPage";
import ProfilePage from "./pages/account/ProfilePage";
import SettingsPage from "./pages/account/SettingsPage";
import RequireAuth from "./routes/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Account area */}
      <Route
        path="/account"
        element={
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/account/appointments" replace />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
