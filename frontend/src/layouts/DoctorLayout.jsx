import React, { useEffect, useState } from "react";
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
            name: res.fullName || 'Bác sĩ',
            type: res.employmentType
            });
        }
        } catch (err) {
        console.error("Lỗi:", err);
        }
    };
    fetchInfo();
    }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="doctor-container">
      {/* Sidebar bên trái */}
      <div className="doctor-sidebar">
        <div className="doctor-profile">
          <div className="avatar-circle">BS</div>
          <div className="doctor-name">{doctorInfo.name}</div>

          {/* Hiển thị Chuyên khoa bác sĩ */}
          <div
            className="doctor-spec"
            style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "500", marginTop: "4px" }}
          >
            {doctorInfo.specialization}
          </div>

          {/* Badge Loại hình công việc */}
          <span className="badge-role" style={{ marginTop: "8px", display: "inline-block" }}>
            {doctorInfo.type === "PART_TIME"
              ? "Bác sĩ Part-Time"
              : "Bác sĩ Full-Time"}
          </span>
        </div>

        <nav>
          <button
            className={`nav-btn ${
              location.pathname.includes("dashboard") ? "active" : ""
            }`}
            onClick={() => navigate("/doctor/dashboard")}
          >
            🩺 Khám bệnh
          </button>

          {/* Chỉ hiển thị nút Đăng ký lịch cho bác sĩ PART_TIME */}
          {doctorInfo.type === "PART_TIME" && (
            <button
              className={`nav-btn ${
                location.pathname.includes("schedule") ? "active" : ""
              }`}
              onClick={() => navigate("/doctor/schedule")}
            >
              📅 Đăng ký lịch
            </button>
          )}

          <button
            className="nav-btn logout-btn"
            onClick={handleLogout}
            style={{ marginTop: "auto" }}
          >
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* Nội dung trang Dashboard bên phải */}
      <div className="doctor-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;