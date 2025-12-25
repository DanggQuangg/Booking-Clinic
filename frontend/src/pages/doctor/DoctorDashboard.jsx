import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorApi from "../../api/doctorApi";
import "./Doctor.css";

const DOC_TABS = [
  { key: "WAITING", label: "Đang chờ" },
  { key: "DONE", label: "Đã khám" },
];

const VITAL_FIELDS = [
  { key: "TEMP_C", label: "Nhiệt độ", unit: "°C", placeholder: "37.2" },
  { key: "PULSE_BPM", label: "Mạch", unit: "bpm", placeholder: "80" },
  { key: "BP_MMHG", label: "Huyết áp", unit: "mmHg", placeholder: "120/80" },
  { key: "SPO2", label: "SpO2", unit: "%", placeholder: "98" },
  { key: "WEIGHT_KG", label: "Cân nặng", unit: "kg", placeholder: "60" },
  { key: "HEIGHT_CM", label: "Chiều cao", unit: "cm", placeholder: "170" },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("WAITING");
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form states
  const [diagnosis, setDiagnosis] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [vitals, setVitals] = useState(() =>
    VITAL_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {})
  );
  const [prescriptions, setPrescriptions] = useState([]);
  const [medInput, setMedInput] = useState({ name: "", quantity: 1, usage: "" });
  const [followUp, setFollowUp] = useState({ date: "", time: "", note: "" });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getQueue();
      setQueue(Array.isArray(res) ? res : []);
    } catch (e) {
      setErr(e?.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQueue = useMemo(() => {
    return queue.filter((p) => (tab === "DONE" ? p.status === "DONE" : p.status !== "DONE"));
  }, [queue, tab]);

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setDiagnosis("");
    setConclusion("");
    setPrescriptions([]);
    setFollowUp({ date: "", time: "", note: "" });
    setVitals(VITAL_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {}));
  };

  const addMed = () => {
    if (!medInput.name.trim()) return;
    setPrescriptions([...prescriptions, { ...medInput, id: Date.now() }]);
    setMedInput({ name: "", quantity: 1, usage: "" });
  };

  const handleSubmit = async () => {
    if (!selectedPatient || selectedPatient.status === "DONE") return;
    if (!diagnosis.trim() || !conclusion.trim()) return alert("Vui lòng điền đủ thông tin!");

    const items = [
      ...VITAL_FIELDS.filter(f => vitals[f.key]).map(f => ({
        itemType: "VITAL_SIGN", itemKey: f.label, itemValue: vitals[f.key]
      })),
      ...prescriptions.map(p => ({
        itemType: "PRESCRIPTION", itemKey: p.name, itemValue: `SL: ${p.quantity}, HD: ${p.usage}`
      })),
      ...(followUp.date ? [{
        itemType: "NOTE", itemKey: "FOLLOW_UP", itemValue: JSON.stringify(followUp)
      }] : [])
    ];

    try {
      await doctorApi.saveMedicalRecord({
        appointmentId: selectedPatient.appointmentId,
        diagnosis, conclusion, items
      });
      alert("✅ Thành công!");
      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* CỘT TRÁI: HÀNG CHỜ */}
      <div className="queue-panel">
        <div className="queue-header">
          <h3>Hàng đợi khám</h3>
          <div className="tab-container">
            {DOC_TABS.map((t) => (
              <button
                key={t.key}
                className={`tab-btn ${tab === t.key ? "active" : ""}`}
                onClick={() => { setTab(t.key); setSelectedPatient(null); }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="action-group">
            <button className="btn-outline" onClick={fetchQueue}>🔄</button>
          </div>
        </div>

        <div className="queue-list">
          {loading ? <p>Đang tải...</p> : filteredQueue.map((p) => (
            <div
              key={p.appointmentId}
              className={`queue-item ${selectedPatient?.appointmentId === p.appointmentId ? "active" : ""}`}
              onClick={() => selectPatient(p)}
            >
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span className="q-time">{p.timeSlot}</span>
                <span className={`q-status ${p.status}`}>{p.status}</span>
              </div>
              <span className="q-name">{p.patientName}</span>
              <small style={{color: '#64748b'}}>{p.gender} • {p.age} tuổi</small>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT KHÁM */}
      <div className="exam-panel">
        {!selectedPatient ? (
          <div style={{textAlign: 'center', marginTop: '20%'}}>
            <h2 style={{color: '#cbd5e1'}}>Chọn bệnh nhân để bắt đầu khám bệnh</h2>
          </div>
        ) : (
          <>
            <div className="patient-header">
              <h2>{selectedPatient.patientName}</h2>
              <p>Lý do: <b>{selectedPatient.reason || "Khám tổng quát"}</b></p>
            </div>

            <span className="section-title">1. Chỉ số sinh hiệu</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: '30px' }}>
              {VITAL_FIELDS.map((f) => (
                <div key={f.key}>
                  <label style={{fontSize: '12px', fontWeight: 700}}>{f.label} ({f.unit})</label>
                  <input
                    className="form-control"
                    placeholder={f.placeholder}
                    value={vitals[f.key]}
                    disabled={tab === "DONE"}
                    onChange={(e) => setVitals({ ...vitals, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <span className="section-title">2. Chẩn đoán & Kết luận</span>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Nhập chẩn đoán bệnh..."
                rows="2"
                value={diagnosis}
                disabled={tab === "DONE"}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Lời dặn bác sĩ..."
                rows="3"
                value={conclusion}
                disabled={tab === "DONE"}
                onChange={(e) => setConclusion(e.target.value)}
              />
            </div>

            <span className="section-title">3. Đơn thuốc & Tái khám</span>
            <div className="med-row">
              <input className="form-control" style={{flex: 2}} placeholder="Tên thuốc" value={medInput.name} onChange={e => setMedInput({...medInput, name: e.target.value})} disabled={tab === "DONE"}/>
              <input className="form-control" style={{width: '70px'}} type="number" value={medInput.quantity} onChange={e => setMedInput({...medInput, quantity: e.target.value})} disabled={tab === "DONE"}/>
              <input className="form-control" style={{flex: 1}} placeholder="Cách dùng" value={medInput.usage} onChange={e => setMedInput({...medInput, usage: e.target.value})} disabled={tab === "DONE"}/>
              <button className="btn-add" onClick={addMed} disabled={tab === "DONE"}>Thêm</button>
            </div>

            <ul className="med-list">
              {prescriptions.map(m => (
                <li key={m.id}>
                  <span>💊 <b>{m.name}</b> (x{m.quantity}) - <small>{m.usage}</small></span>
                  {tab !== "DONE" && <span style={{color: 'red', cursor: 'pointer'}} onClick={() => setPrescriptions(prescriptions.filter(x => x.id !== m.id))}>Xóa</span>}
                </li>
              ))}
            </ul>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px'}}>
               <input type="date" className="form-control" value={followUp.date} onChange={e => setFollowUp({...followUp, date: e.target.value})} disabled={tab === "DONE"}/>
               <input type="text" className="form-control" placeholder="Ghi chú tái khám" value={followUp.note} onChange={e => setFollowUp({...followUp, note: e.target.value})} disabled={tab === "DONE"}/>
            </div>

            {tab !== "DONE" && (
              <button className="btn-success" onClick={handleSubmit}>
                XÁC NHẬN & HOÀN TẤT KHÁM
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;