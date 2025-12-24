import React, { useEffect, useMemo, useState } from "react";
import doctorApi from "../../api/doctorApi";
import "./Doctor.css";

// 2 tab cho bác sĩ: đang chờ / đã khám
const DOC_TABS = [
  { key: "WAITING", label: "Đang chờ" },
  { key: "DONE", label: "Đã khám" },
];

// map sinh hiệu -> itemKey
const VITAL_FIELDS = [
  { key: "TEMP_C", label: "Nhiệt độ (°C)", placeholder: "VD: 37.2" },
  { key: "PULSE_BPM", label: "Mạch (bpm)", placeholder: "VD: 80" },
  { key: "BP_MMHG", label: "Huyết áp (mmHg)", placeholder: "VD: 120/80" },
  { key: "RESP_RATE", label: "Nhịp thở (lần/phút)", placeholder: "VD: 18" },
  { key: "SPO2", label: "SpO2 (%)", placeholder: "VD: 98" },
  { key: "WEIGHT_KG", label: "Cân nặng (kg)", placeholder: "VD: 60" },
  { key: "HEIGHT_CM", label: "Chiều cao (cm)", placeholder: "VD: 170" },
];
function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function fmtDateVN(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

const DoctorDashboard = () => {
  const [tab, setTab] = useState("WAITING");
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form khám
  const [diagnosis, setDiagnosis] = useState("");
  const [conclusion, setConclusion] = useState("");

  // Sinh hiệu
  const [vitals, setVitals] = useState(() =>
    VITAL_FIELDS.reduce((acc, f) => {
      acc[f.key] = "";
      return acc;
    }, {})
  );

  // Đơn thuốc
  const [prescriptions, setPrescriptions] = useState([]);
  const [medInput, setMedInput] = useState({ name: "", quantity: 1, usage: "" });

  // Tái khám
  const [followUp, setFollowUp] = useState({ date: "", time: "", note: "" });

  // loading / error
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await doctorApi.getQueue();
      // res đã là array
      setQueue(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Lỗi tải hàng chờ:", e);
      setErr(e?.message || "Không tải được danh sách.");
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // lọc theo tab
  const filteredQueue = useMemo(() => {
    if (tab === "DONE") return queue.filter((p) => p.status === "DONE");
    return queue.filter((p) => p.status !== "DONE");
  }, [queue, tab]);

  const resetForm = () => {
    setDiagnosis("");
    setConclusion("");
    setPrescriptions([]);
    setMedInput({ name: "", quantity: 1, usage: "" });
    setFollowUp({ date: "", time: "", note: "" });
    setVitals(
      VITAL_FIELDS.reduce((acc, f) => {
        acc[f.key] = "";
        return acc;
      }, {})
    );
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    resetForm();

    // Nếu hàng chờ có sẵn reason chứa "PAID_METHOD=..." thì giữ nguyên hiển thị
    // Không tự fill gì khác, vì record cũ có thể cần endpoint riêng.
  };

  // thêm thuốc
  const addMed = () => {
    const name = (medInput.name || "").trim();
    if (!name) return;

    const qty = Number(medInput.quantity || 1);
    const usage = (medInput.usage || "").trim();

    setPrescriptions((prev) => [
      ...prev,
      { id: Date.now(), name, quantity: Number.isNaN(qty) ? 1 : qty, usage },
    ]);
    setMedInput({ name: "", quantity: 1, usage: "" });
  };

  const removeMed = (id) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  // build items: sinh hiệu + đơn thuốc + tái khám
  const buildItems = () => {
    const items = [];

    // vitals -> itemType VITAL_SIGN
    for (const f of VITAL_FIELDS) {
      const v = (vitals[f.key] || "").trim();
      if (!v) continue;
      items.push({
        itemType: "VITAL_SIGN",
        itemKey: f.label, // hiển thị đẹp bên bệnh nhân
        itemValue: v,
      });
    }

    // prescriptions
    for (const p of prescriptions) {
      items.push({
        itemType: "PRESCRIPTION",
        itemKey: p.name,
        itemValue: `SL: ${p.quantity}, HD: ${p.usage || ""}`.trim(),
      });
    }

    // follow-up -> NOTE/FOLLOW_UP (JSON)
    if ((followUp.date || "").trim()) {
      const payload = {
        date: followUp.date || "",
        time: followUp.time || "",
        note: followUp.note || "",
      };
      items.push({
        itemType: "NOTE",
        itemKey: "FOLLOW_UP",
        itemValue: JSON.stringify(payload),
      });
    }

    return items;
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;

    // chỉ cho submit khi đang ở tab WAITING (không submit cho DONE)
    if (selectedPatient.status === "DONE") {
      alert("Lịch này đã khám xong (DONE). Không thể ghi đè.");
      return;
    }

    if (!diagnosis.trim() || !conclusion.trim()) {
      alert("Vui lòng nhập chẩn đoán và kết luận!");
      return;
    }

    const payload = {
      appointmentId: selectedPatient.appointmentId,
      diagnosis: diagnosis.trim(),
      conclusion: conclusion.trim(),
      items: buildItems(),
    };

    try {
      await doctorApi.saveMedicalRecord(payload);
      alert("✅ Đã hoàn tất khám bệnh!");

      setSelectedPatient(null);
      resetForm();
      fetchQueue(); // reload để bệnh nhân DONE chuyển qua tab Đã khám
    } catch (e) {
      alert("Lỗi lưu bệnh án: " + (e?.response?.data || e?.message || "Lỗi server"));
    }
  };

  // hiển thị nhãn status đẹp
  const statusLabel = (s) => {
    if (s === "DONE") return "DONE";
    if (s === "CONFIRMED") return "CONFIRMED";
    if (s === "AWAITING_PAYMENT") return "AWAITING_PAYMENT";
    return s || "UNKNOWN";
  };

  return (
    <div className="dashboard-wrapper">
      {/* CỘT TRÁI: DANH SÁCH */}
      <div className="queue-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h3>Danh sách ({filteredQueue.length})</h3>
          <button className="btn-submit" style={{ width: 110, padding: "8px 10px" }} onClick={fetchQueue}>
            Tải lại
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {DOC_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedPatient(null);
                resetForm();
              }}
              className="btn-submit"
              style={{
                flex: 1,
                background: t.key === tab ? "#1976d2" : "white",
                color: t.key === tab ? "white" : "#1976d2",
                border: "1px solid #1976d2",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#666", marginTop: 16 }}>Đang tải…</p>
        ) : err ? (
          <p style={{ textAlign: "center", color: "crimson", marginTop: 16 }}>{err}</p>
        ) : null}

        <div className="queue-list" style={{ marginTop: 10 }}>
          {filteredQueue.length === 0 && (
            <p style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
              {tab === "DONE" ? "Chưa có ca đã khám." : "Hiện không có bệnh nhân."}
            </p>
          )}

          {filteredQueue.map((p) => (
            <div
              key={p.appointmentId}
              className={`queue-item ${selectedPatient?.appointmentId === p.appointmentId ? "active" : ""}`}
              onClick={() => selectPatient(p)}
            >
              <span className="q-time">🕒 {p.timeSlot}</span>
              <span className="q-name">{p.patientName}</span>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <small>
                  {p.gender} - {p.age} tuổi
                </small>
                <span className={`q-status ${p.status}`}>{statusLabel(p.status)}</span>
              </div>

              {p.reason ? (
                <small style={{ display: "block", color: "#666", marginTop: 5 }}>Lý do: {p.reason}</small>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: FORM KHÁM */}
      <div className="exam-panel">
        {!selectedPatient ? (
          <div
            style={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#aaa",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👈</div>
            <h2>Chọn bệnh nhân từ danh sách để bắt đầu</h2>
          </div>
        ) : (
          <>
            <div className="patient-header">
              <h2>Đang khám: {selectedPatient.patientName}</h2>
              <p>
                <strong>Lý do khám:</strong> {selectedPatient.reason || "Không có ghi chú"}
              </p>
              {selectedPatient.status === "DONE" ? (
                <p style={{ color: "#0f766e", fontWeight: 800 }}>Ca này đã DONE (chỉ xem)</p>
              ) : null}
            </div>

            {/* Sinh hiệu */}
            <div className="form-group">
              <label style={{ fontWeight: 800 }}>Sinh hiệu bệnh nhân</label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {VITAL_FIELDS.map((f) => (
                  <div key={f.key}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      {f.label}
                    </div>
                    <input
                      className="form-control"
                      placeholder={f.placeholder}
                      value={vitals[f.key]}
                      disabled={selectedPatient.status === "DONE"}
                      onChange={(e) => setVitals((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Chẩn đoán bệnh (Diagnosis)</label>
              <textarea
                className="form-control"
                rows="2"
                value={diagnosis}
                disabled={selectedPatient.status === "DONE"}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="VD: Viêm họng cấp..."
              />
            </div>

            <div className="form-group">
              <label>Kết luận & Lời dặn</label>
              <textarea
                className="form-control"
                rows="3"
                value={conclusion}
                disabled={selectedPatient.status === "DONE"}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Nghỉ ngơi, uống nhiều nước..."
              />
            </div>

            {/* Tái khám */}
            <div className="form-group">
              <label style={{ fontWeight: 800 }}>Lịch hẹn tái khám (tùy chọn)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Ngày tái khám</div>
                  <input
                    type="date"
                    className="form-control"
                    value={followUp.date}
                    disabled={selectedPatient.status === "DONE"}
                    onChange={(e) => setFollowUp((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>Giờ tái khám</div>
                  <input
                    type="time"
                    className="form-control"
                    value={followUp.time}
                    disabled={selectedPatient.status === "DONE"}
                    onChange={(e) => setFollowUp((p) => ({ ...p, time: e.target.value }))}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                    Ghi chú tái khám
                  </div>
                  <input
                    className="form-control"
                    placeholder="VD: Tái khám sau 3 ngày"
                    value={followUp.note}
                    disabled={selectedPatient.status === "DONE"}
                    onChange={(e) => setFollowUp((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Đơn thuốc */}
            <div className="form-group">
              <label>Kê đơn thuốc (Tùy chọn)</label>

              <div className="med-row">
                <input
                  placeholder="Tên thuốc"
                  className="form-control"
                  style={{ flex: 2 }}
                  value={medInput.name}
                  disabled={selectedPatient.status === "DONE"}
                  onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="SL"
                  className="form-control"
                  style={{ width: "80px" }}
                  value={medInput.quantity}
                  disabled={selectedPatient.status === "DONE"}
                  onChange={(e) => setMedInput({ ...medInput, quantity: e.target.value })}
                />
                <input
                  placeholder="Cách dùng"
                  className="form-control"
                  style={{ flex: 1 }}
                  value={medInput.usage}
                  disabled={selectedPatient.status === "DONE"}
                  onChange={(e) => setMedInput({ ...medInput, usage: e.target.value })}
                />
                <button className="btn-add" onClick={addMed} disabled={selectedPatient.status === "DONE"}>
                  +
                </button>
              </div>

              <ul className="med-list">
                {prescriptions.map((item) => (
                  <li key={item.id}>
                    <span>
                      💊 <b>{item.name}</b> (x{item.quantity}) - {item.usage}
                    </span>
                    {selectedPatient.status !== "DONE" ? (
                      <span className="btn-remove" onClick={() => removeMed(item.id)}>
                        ×
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {selectedPatient.status !== "DONE" ? (
              <button className="btn-submit" onClick={handleSubmit}>
                HOÀN TẤT KHÁM BỆNH
              </button>
            ) : (
              <div style={{ marginTop: 10, color: "#64748b", fontWeight: 700 }}>
                Ca đã khám xong. Muốn xem lại record (read-only) thì cần endpoint GET record cho bác sĩ.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
