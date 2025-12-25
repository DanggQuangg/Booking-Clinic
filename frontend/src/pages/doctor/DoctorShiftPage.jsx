import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorApi from "../../api/doctorApi";
import "./Doctor.css";

const SHIFT_META = {
  MORNING: { label: "Ca Sáng", time: "07:00 - 11:30" },
  AFTERNOON: { label: "Ca Chiều", time: "12:30 - 17:00" },
};

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

function fmtVNDate(iso) {
  if (!iso) return "";
  const [y, m, day] = iso.split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function dayLabelFromDate(d) {
  const dow = d.getDay();
  return dow === 0 ? "Chủ Nhật" : `Thứ ${dow + 1}`;
}

const DoctorShiftPage = () => {
  const navigate = useNavigate();

  // 7 ngày tới (bắt đầu từ ngày mai)
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push({
        dateStr: toISODate(d),
        dayLabel: dayLabelFromDate(d),
        dateDisplay: `${d.getDate()}/${d.getMonth() + 1}`,
      });
    }
    return arr;
  }, []);

  const range = useMemo(() => {
    const from = days?.[0]?.dateStr;
    const to = days?.[days.length - 1]?.dateStr;
    return { from, to };
  }, [days]);

  const [selectedShifts, setSelectedShifts] = useState({}); // key: `${date}_${shift}` => boolean

  // ✅ shifts đã đăng ký trong khoảng 7 ngày tới
  // mapKey: `${workDate}_${shift}` => shiftObj
  const [myShiftMap, setMyShiftMap] = useState({});
  const [loadingMyShifts, setLoadingMyShifts] = useState(false);

  const loadMyShifts = async () => {
    if (!range.from || !range.to) return;
    setLoadingMyShifts(true);
    try {
      const res = await doctorApi.getMyShifts({ from: range.from, to: range.to });
      // kỳ vọng backend trả về array:
      // [{ id, workDate:'YYYY-MM-DD', shift:'MORNING'|'AFTERNOON', status:'REGISTERED'|'APPROVED'|'CANCELLED', roomName?, hasAppointment? }]
      const arr = Array.isArray(res) ? res : res?.items || res?.data || [];
      const map = {};
      for (const s of arr) {
        if (!s?.workDate || !s?.shift) continue;
        map[`${s.workDate}_${s.shift}`] = s;
      }
      setMyShiftMap(map);
    } catch (err) {
      console.error(err);
      alert("Không tải được lịch đã đăng ký: " + (err?.response?.data || err?.message || "Lỗi"));
    } finally {
      setLoadingMyShifts(false);
    }
  };

  useEffect(() => {
    loadMyShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const toggleShift = (date, shift) => {
    const key = `${date}_${shift}`;
    // nếu đã có lịch và chưa CANCELLED => không cho tick
    const existing = myShiftMap[key];
    if (existing && existing.status !== "CANCELLED") return;

    setSelectedShifts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const shiftsToSend = Object.keys(selectedShifts)
      .filter((key) => selectedShifts[key])
      // ✅ chỉ gửi những ca chưa tồn tại (hoặc đã CANCELLED)
      .filter((key) => {
        const exist = myShiftMap[key];
        return !exist || exist.status === "CANCELLED";
      })
      .map((key) => {
        const [date, shift] = key.split("_");
        return { workDate: date, shift };
      });

    if (shiftsToSend.length === 0) {
      alert("Không có ca hợp lệ để gửi (có thể bạn đã đăng ký hết các ca đã chọn).");
      return;
    }

    try {
      await doctorApi.registerShifts(shiftsToSend);
      alert(`✅ Đã đăng ký thành công ${shiftsToSend.length} ca làm việc!`);
      setSelectedShifts({});
      await loadMyShifts();
      navigate("/doctor");
    } catch (err) {
      alert("Lỗi đăng ký: " + (err?.response?.data || err?.message || "Thất bại"));
    }
  };

  const handleCancel = async (shiftObj) => {
    if (!shiftObj?.id) return;

    // ✅ Nếu backend báo ca đã có bệnh nhân đặt -> disable nút, nên không vào đây
    const ok = window.confirm(
      `Bạn chắc chắn muốn HỦY ca ${SHIFT_META[shiftObj.shift]?.label || shiftObj.shift} - ${fmtVNDate(
        shiftObj.workDate
      )}?`
    );
    if (!ok) return;

    try {
      await doctorApi.cancelShift(shiftObj.id);
      alert("✅ Đã hủy lịch thành công!");
      await loadMyShifts();
    } catch (err) {
      alert("Lỗi hủy lịch: " + (err?.response?.data || err?.message || "Thất bại"));
    }
  };

  // ✅ danh sách đã đăng ký (lọc: != CANCELLED) để hiển thị
  const myRegisteredList = useMemo(() => {
    const arr = Object.values(myShiftMap || {}).filter((s) => s && s.status && s.status !== "CANCELLED");
    arr.sort((a, b) => {
      if (a.workDate !== b.workDate) return a.workDate.localeCompare(b.workDate);
      return String(a.shift).localeCompare(String(b.shift));
    });
    return arr;
  }, [myShiftMap]);

  const groupedByDate = useMemo(() => {
    const g = {};
    for (const s of myRegisteredList) {
      const d = s.workDate;
      if (!g[d]) g[d] = [];
      g[d].push(s);
    }
    return g;
  }, [myRegisteredList]);

  const statusBadge = (st) => {
    if (st === "APPROVED") return <span className="shift-badge approved">Đã duyệt</span>;
    if (st === "REGISTERED") return <span className="shift-badge registered">Đã đăng ký</span>;
    if (st === "CANCELLED") return <span className="shift-badge cancelled">Đã hủy</span>;
    return <span className="shift-badge">{st}</span>;
  };

  return (
    <div className="shift-container">
      <div className="shift-header-section">
        <div>
          <button className="btn-outline" onClick={() => navigate("/doctor")} style={{ marginBottom: "12px" }}>
            ← Quay lại Dashboard
          </button>
          <h2 style={{ fontSize: "2rem", margin: 0, color: "#0f172a" }}>Đăng ký lịch trực</h2>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            Chọn các ca làm việc của bạn trong 7 ngày tới. Hệ thống sẽ ghi nhận và gửi tới quản trị viên.
          </p>
        </div>

        <button className="btn-primary" style={{ padding: "14px 30px", fontSize: "1rem" }} onClick={handleSubmit}>
          Gửi bản đăng ký
        </button>
      </div>

      {/* ✅ LỊCH ĐÃ ĐĂNG KÝ */}
      <div className="my-shifts-card">
        <div className="my-shifts-head">
          <div>
            <div className="my-shifts-title">Lịch đã đăng ký (7 ngày tới)</div>
            <div className="my-shifts-sub">Tự động khóa các ca đã đăng ký để tránh đăng ký trùng.</div>
          </div>
          {loadingMyShifts && <div className="my-shifts-loading">Đang tải...</div>}
        </div>

        {!loadingMyShifts && myRegisteredList.length === 0 ? (
          <div className="my-shifts-empty">Chưa có lịch nào trong 7 ngày tới.</div>
        ) : (
          <div className="my-shifts-body">
            {Object.keys(groupedByDate).map((d) => (
              <div className="my-shifts-day" key={d}>
                <div className="my-shifts-dayhead">
                  <span className="my-shifts-date">{fmtVNDate(d)}</span>
                </div>

                <div className="my-shifts-items">
                  {groupedByDate[d].map((s) => {
                    const cannotCancel = !!s.hasAppointment; // ✅ NEW
                    return (
                      <div className="my-shifts-item" key={s.id}>
                        <div className="my-shifts-left">
                          <div className="my-shifts-shift">
                            <b>{SHIFT_META[s.shift]?.label || s.shift}</b>
                            <span className="my-shifts-time">{SHIFT_META[s.shift]?.time || ""}</span>
                          </div>
                          <div className="my-shifts-meta">
                            {statusBadge(s.status)}
                            {s.roomName ? <span className="shift-room">Phòng: {s.roomName}</span> : null}

                            {/* ✅ Optional: hiện nhắc nếu có bệnh nhân đặt */}
                            {cannotCancel ? <span className="shift-room">• Đã có bệnh nhân đặt</span> : null}
                          </div>
                        </div>

                        <div className="my-shifts-right">
                          {s.status !== "CANCELLED" ? (
                            <button
                              className={`btn-danger ${cannotCancel ? "is-disabled" : ""}`}
                              disabled={cannotCancel}
                              onClick={() => {
                                if (!cannotCancel) handleCancel(s);
                              }}
                              title={cannotCancel ? "Không thể hủy: đã có bệnh nhân đặt lịch" : "Hủy lịch"}
                            >
                              Hủy lịch
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID CHỌN CA */}
      <div className="shift-card-grid">
        {days.map((day) => {
          const keyMorning = `${day.dateStr}_MORNING`;
          const keyAfternoon = `${day.dateStr}_AFTERNOON`;

          const existMorning = myShiftMap[keyMorning];
          const existAfternoon = myShiftMap[keyAfternoon];

          const disabledMorning = existMorning && existMorning.status !== "CANCELLED";
          const disabledAfternoon = existAfternoon && existAfternoon.status !== "CANCELLED";

          return (
            <div className="shift-row" key={day.dateStr}>
              <div className="day-info">
                <span className="day-label">{day.dayLabel}</span>
                <span className="day-sub">Ngày {day.dateDisplay}</span>
              </div>

              {/* Ca Sáng */}
              <label className={`shift-option ${disabledMorning ? "is-disabled" : ""}`}>
                <input
                  type="checkbox"
                  disabled={disabledMorning}
                  checked={disabledMorning ? true : !!selectedShifts[keyMorning]}
                  onChange={() => toggleShift(day.dateStr, "MORNING")}
                />
                <div className="shift-box">
                  <span className="shift-title">
                    Ca Sáng{" "}
                    {disabledMorning ? (
                      <span className="shift-mini-badge">
                        {existMorning?.status === "APPROVED" ? "Đã duyệt" : "Đã đăng ký"}
                      </span>
                    ) : null}
                  </span>
                  <span className="shift-time">07:00 - 11:30</span>
                </div>
              </label>

              {/* Ca Chiều */}
              <label className={`shift-option ${disabledAfternoon ? "is-disabled" : ""}`}>
                <input
                  type="checkbox"
                  disabled={disabledAfternoon}
                  checked={disabledAfternoon ? true : !!selectedShifts[keyAfternoon]}
                  onChange={() => toggleShift(day.dateStr, "AFTERNOON")}
                />
                <div className="shift-box">
                  <span className="shift-title">
                    Ca Chiều{" "}
                    {disabledAfternoon ? (
                      <span className="shift-mini-badge">
                        {existAfternoon?.status === "APPROVED" ? "Đã duyệt" : "Đã đăng ký"}
                      </span>
                    ) : null}
                  </span>
                  <span className="shift-time">12:30 - 17:00</span>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "right", color: "#94a3b8", fontSize: "0.9rem" }}>
        * Lưu ý: Lịch đăng ký cần được thực hiện trước 24h để hệ thống sắp xếp.
      </div>
    </div>
  );
};

export default DoctorShiftPage;
