import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";

import AccountLayout from "./pages/account/AccountLayout";
import AppointmentsPage from "./pages/account/AppointmentsPage";
import PaymentsPage from "./pages/account/PaymentsPage";
import ProfilePage from "./pages/account/ProfilePage";
import SettingsPage from "./pages/account/SettingsPage";

import RequireAuth from "./routes/RequireAuth";

import BookStep1Specialty from "./pages/BookStep1Specialty";
import BookStep2DateDoctor from "./pages/BookStep2DateDoctor";
import BookStep3Slot from "./pages/BookStep3Slot";
import BookStep4ProfileConfirm from "./pages/BookStep4ProfileConfirm";
import InvoicePage from "./pages/InvoicePage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";
import PricingPage from "./pages/PricingPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceBookingPage from "./pages/ServiceBookingPage";

import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorShiftPage from "./pages/doctor/DoctorShiftPage";

// Chatbot (đảm bảo đúng path file của bạn)
import Chatbot from "./components/Chatbot";

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public */}
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />

        <Route path="/book" element={<BookStep1Specialty />} />
        <Route path="/book/step2" element={<BookStep2DateDoctor />} />
        <Route path="/book/step3" element={<BookStep3Slot />} />
        <Route path="/book/step4" element={<BookStep4ProfileConfirm />} />
        <Route path="/book/invoice" element={<InvoicePage />} />

        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceBookingPage />} />

        {/* DOCTOR (protected) */}
        <Route element={<RequireAuth allowedRoles={["DOCTOR"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="schedule" element={<DoctorShiftPage />} />
          </Route>
        </Route>

        {/* PATIENT (protected) */}
        <Route element={<RequireAuth allowedRoles={["PATIENT"]} />}>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chatbot luôn hiển thị đè lên mọi trang */}
      <Chatbot />
    </div>
  );
}
