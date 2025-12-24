import React, { useMemo, useState } from "react";
import doctorApi from "../../api/doctorApi";
import "./Doctor.css";

const DoctorShiftPage = () => {
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      // hiển thị thứ
      const dow = d.getDay(); // 0=CN
      const label = dow === 0 ? "CN" : `Thứ ${dow + 1}`;

      arr.push({
        dateStr: d.toISOString().split("T")[0], // YYYY-MM-DD
        display: `${label} (${d.getDate()}/${d.getMonth() + 1})`,
      });
    }
    return arr;
  }, []);

  const [selectedShifts, setSelectedShifts] = useState({});

  const toggleShift = (date, shift) => {
    const key = `${date}_${shift}`;
    setSelectedShifts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const shiftsToSend = Object.keys(selectedShifts)
      .filter((key) => selectedShifts[key])
      .map((key) => {
        const [date, shift] = key.split("_");
        return { workDate: date, shift };
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
      alert("Lỗi đăng ký: " + (err?.response?.data || err?.message || "Thất bại"));
    }
  };

  return (
    <div className="shift-wrapper">
      <h2 style={{ color: "#1976d2" }}>📅 Đăng ký lịch làm việc</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Vui lòng chọn các ca bạn có thể làm việc trong 7 ngày tới.
        <br />
        Lịch sẽ được gửi lên hệ thống để Admin duyệt.
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
          {days.map((day) => (
            <tr key={day.dateStr}>
              <td style={{ textAlign: "left", fontWeight: "bold", color: "#333" }}>{day.display}</td>
              <td>
                <input
                  type="checkbox"
                  className="check-input"
                  checked={!!selectedShifts[`${day.dateStr}_MORNING`]}
                  onChange={() => toggleShift(day.dateStr, "MORNING")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  className="check-input"
                  checked={!!selectedShifts[`${day.dateStr}_AFTERNOON`]}
                  onChange={() => toggleShift(day.dateStr, "AFTERNOON")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-submit" onClick={handleSubmit} style={{ width: "200px", float: "right" }}>
        Gửi đăng ký
      </button>
    </div>
  );
};

export default DoctorShiftPage;
