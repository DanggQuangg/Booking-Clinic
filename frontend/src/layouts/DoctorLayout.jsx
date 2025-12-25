import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import doctorApi from "../api/doctorApi";
import "../pages/doctor/Doctor.css";

const DoctorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State lưu trữ đầy đủ thông tin bác sĩ
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Đang tải...",
    type: "",
    specialization: "",
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await doctorApi.getDashboardInfo();
        // res là object trực tiếp từ backend, KHÔNG DÙNG res.data
        if (res) {
          setDoctorInfo({
            name: res.fullName || "Bác sĩ",
            type: res.employmentType || "",
            specialization: res.specialization || "Chuyên khoa tổng quát",
          });
        }
      } catch (err) {
        console.error("Lỗi fetch info:", err);
        setDoctorInfo((prev) => ({ ...prev, name: "Bác sĩ" }));
      }
    };
    fetchInfo();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const getInitial = (name) => {
    if (!name || name === "Đang tải...") return "BS";
    const parts = String(name).trim().split(/\s+/);
    return (parts[parts.length - 1]?.charAt(0) || "B").toUpperCase();
  };

  // ✅ Normalize employmentType để không bị sai format
  const normalizedType = (doctorInfo.type || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace("-", "_"); // PART-TIME -> PART_TIME

  const isPartTime = normalizedType === "PART_TIME";
  const isFullTime = normalizedType === "FULL_TIME";

  const typeLabel = isPartTime ? "Part-Time" : isFullTime ? "Full-Time" : "Doctor";

  const activeKey = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/doctor/profile")) return "PROFILE";
    if (path.includes("/doctor/schedule")) return "SCHEDULE";
    return "DASHBOARD";
  }, [location.pathname]);

  return (
    <div className="doctor-container">
      <aside className="doctor-sidebar">
        <div className="sidebar-profile">
          <div className="avatar-wrapper">{getInitial(doctorInfo.name)}</div>

          {/* ✅ Không cố định chữ “Bác sĩ” nữa */}
          <span className="doctor-name">{doctorInfo.name}</span>
          <span className="doctor-spec">{doctorInfo.specialization}</span>

          <span className="badge-role">{typeLabel}</span>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeKey === "DASHBOARD" ? "active" : ""}`}
            onClick={() => navigate("/doctor/dashboard")}
          >
            <span className="menu-icon">🩺</span> Khám bệnh
          </button>

          {/* ✅ OPTION A: chỉ hiện khi đúng PART_TIME (đã normalize) */}
          {isPartTime && (
            <button
              className={`menu-item ${activeKey === "SCHEDULE" ? "active" : ""}`}
              onClick={() => navigate("/doctor/schedule")}
            >
              <span className="menu-icon">📅</span> Đăng kí lịch khám
            </button>
          )}

          <button
            className={`menu-item ${activeKey === "PROFILE" ? "active" : ""}`}
            onClick={() => navigate("/doctor/profile")}
          >
            <span className="menu-icon">👤</span> Hồ sơ bác sĩ
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn-modern" onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="doctor-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
