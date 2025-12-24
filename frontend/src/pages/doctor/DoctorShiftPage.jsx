import React, { useState } from 'react';
import doctorApi from '../../api/doctorApi';
import './Doctor.css';

const DoctorShiftPage = () => {
  // Tạo danh sách 7 ngày tiếp theo để đăng ký
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            dateStr: d.toISOString().split('T')[0], // Format YYYY-MM-DD
            display: `Thứ ${d.getDay() + 1 === 1 ? 'CN' : d.getDay() + 1} (${d.getDate()}/${d.getMonth()+1})`
        });
    }
    return days;
  };

  const days = getNext7Days();
  const [selectedShifts, setSelectedShifts] = useState({});

  const toggleShift = (date, shift) => {
    const key = `${date}_${shift}`;
    setSelectedShifts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    // Chuyển object state thành mảng gửi xuống backend
    const shiftsToSend = Object.keys(selectedShifts)
        .filter(key => selectedShifts[key])
        .map(key => {
            const [date, shift] = key.split('_');
            return { workDate: date, shift: shift };
        });

    if (shiftsToSend.length === 0) {
        alert("Vui lòng chọn ít nhất 1 ca!");
        return;
    }

    try {
        await doctorApi.registerShifts(shiftsToSend);
        alert(`✅ Đã đăng ký thành công ${shiftsToSend.length} ca làm việc!`);
        setSelectedShifts({});
    } catch (err) {
        alert("Lỗi đăng ký: " + (err.response?.data || "Thất bại"));
    }
  };

  return (
    <div className="shift-wrapper">
      <h2 style={{color: '#1976d2'}}>📅 Đăng ký lịch làm việc</h2>
      <p style={{color:'#666', marginBottom:'20px'}}>
        Vui lòng chọn các ca bạn có thể làm việc trong 7 ngày tới. 
        <br/>Lịch sẽ được gửi lên hệ thống để Admin duyệt.
      </p>
      
      <table className="shift-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Sáng (07:00 - 11:30)</th>
            <th>Chiều (12:30 - 17:00)</th>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day.dateStr}>
              <td style={{textAlign:'left', fontWeight:'bold', color:'#333'}}>{day.display}</td>
              <td>
                <input type="checkbox" className="check-input"
                    checked={!!selectedShifts[`${day.dateStr}_MORNING`]}
                    onChange={() => toggleShift(day.dateStr, 'MORNING')}
                />
              </td>
              <td>
                <input type="checkbox" className="check-input"
                    checked={!!selectedShifts[`${day.dateStr}_AFTERNOON`]}
                    onChange={() => toggleShift(day.dateStr, 'AFTERNOON')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-submit" onClick={handleSubmit} style={{width:'200px', float:'right'}}>
        Gửi đăng ký
      </button>
    </div>
  );
};

export default DoctorShiftPage;