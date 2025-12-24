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
    // Đăng ký lịch làm việc
    registerShifts: (shifts) => {
        return apiPost('/api/doctor/register-shift', shifts);
    }
};

export default doctorApi;