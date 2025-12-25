// Import từng hàm lẻ thay vì import default
import { apiGet, apiPost } from '../lib/api'; 

const doctorApi = {
    // Lấy thông tin Dashboard
    getDashboardInfo: () => {
        return apiGet('/api/doctor/info');
    },
    // Lấy danh sách bệnh nhân chờ khám
    getQueue: () => {
        return apiGet('/api/doctor/queue');
    },
    // Lưu bệnh án
    saveMedicalRecord: (data) => {
        return apiPost('/api/doctor/medical-records', data);
    },
    updateProfile(payload) {
        return apiPut("/api/doctor/profile", payload);
    },

    // Đăng ký lịch làm việc
    registerShifts: (shifts) => {
        return apiPost('/api/doctor-internal/shifts/register', shifts);
    },
    getMyShifts: ({ from, to }) =>
    apiGet(`/api/doctor-internal/shifts/my?from=${from}&to=${to}`),

  // ✅ Hủy 1 lịch trực (set CANCELLED)
  cancelShift: (shiftId) =>
    apiPost(`/api/doctor-internal/shifts/${shiftId}/cancel`, {})

};

export default doctorApi;