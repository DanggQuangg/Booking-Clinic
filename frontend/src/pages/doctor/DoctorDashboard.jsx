import React, { useState, useEffect } from 'react';
import doctorApi from '../../api/doctorApi';
import './Doctor.css';

    const DoctorDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    // State Form Khám
    const [diagnosis, setDiagnosis] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [medInput, setMedInput] = useState({ name: '', quantity: 1, usage: '' });

    // Load danh sách chờ mỗi khi vào trang
    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
    try {
      const res = await doctorApi.getQueue();
      
      // 👇 SỬA ĐOẠN NÀY:
      setQueue(res); // 🟢 ĐÚNG (Bỏ chữ .data đi)
      // setQueue(res.data); 🔴 SAI (Xóa dòng này)

    } catch (err) {
      console.error("Lỗi tải hàng chờ:", err);
      setQueue([]);
    }
    };

  // Thêm thuốc vào danh sách tạm
    const addMed = () => {
        if (!medInput.name) return;
        setPrescriptions([...prescriptions, { ...medInput, id: Date.now() }]);
        setMedInput({ name: '', quantity: 1, usage: '' });
    };

    // Xóa thuốc
    const removeMed = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    // Gửi kết quả khám xuống Backend
    const handleSubmit = async () => {
        if (!selectedPatient) return;

        if (!diagnosis || !conclusion) {
            alert("Vui lòng nhập chẩn đoán và kết luận!");
            return;
        }

        // Chuẩn bị dữ liệu đúng format Backend cần
        const payload = {
        appointmentId: selectedPatient.appointmentId,
        diagnosis: diagnosis,
        conclusion: conclusion,
        items: prescriptions.map(p => ({
            itemType: 'PRESCRIPTION',
            itemKey: p.name,
            itemValue: `SL: ${p.quantity}, HD: ${p.usage}`
        }))
        };

        try {
        await doctorApi.saveMedicalRecord(payload);
        alert("✅ Đã hoàn tất khám bệnh!");
        
        // Reset form & Reload queue
        setDiagnosis('');
        setConclusion('');
        setPrescriptions([]);
        setSelectedPatient(null);
        fetchQueue(); 
        } catch (err) {
        alert("Lỗi lưu bệnh án: " + (err.response?.data || "Lỗi server"));
        }
    };

    return (
        <div className="dashboard-wrapper">
        {/* CỘT TRÁI: DANH SÁCH CHỜ */}
        <div className="queue-panel">
            <h3>Danh sách chờ ({queue.length})</h3>
            <div className="queue-list">
            {queue.length === 0 && <p style={{textAlign:'center', color:'#999', marginTop:'20px'}}>Hiện không có bệnh nhân.</p>}
            
            {queue.map(p => (
                <div 
                key={p.appointmentId} 
                className={`queue-item ${selectedPatient?.appointmentId === p.appointmentId ? 'active' : ''}`}
                onClick={() => setSelectedPatient(p)}
                >
                <span className="q-time">🕒 {p.timeSlot}</span>
                <span className="q-name">{p.patientName}</span>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'5px'}}>
                    <small>{p.gender} - {p.age} tuổi</small>
                    <span className={`q-status ${p.status}`}>{p.status}</span>
                </div>
                {p.reason && <small style={{display:'block', color:'#666', marginTop:'5px'}}>Lý do: {p.reason}</small>}
                </div>
            ))}
            </div>
        </div>

        {/* CỘT PHẢI: FORM KHÁM */}
        <div className="exam-panel">
            {!selectedPatient ? (
            <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', flexDirection:'column', color:'#aaa'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>👈</div>
                <h2>Chọn bệnh nhân từ danh sách để bắt đầu khám</h2>
            </div>
            ) : (
            <>
                <div className="patient-header">
                <h2>Đang khám: {selectedPatient.patientName}</h2>
                <p><strong>Lý do khám:</strong> {selectedPatient.reason || 'Không có ghi chú'}</p>
                </div>

                <div className="form-group">
                <label>Chẩn đoán bệnh (Diagnosis)</label>
                <textarea 
                    className="form-control" rows="2"
                    value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                    placeholder="VD: Viêm họng cấp..."
                />
                </div>

                <div className="form-group">
                <label>Kết luận & Lời dặn</label>
                <textarea 
                    className="form-control" rows="3"
                    value={conclusion} onChange={e => setConclusion(e.target.value)}
                    placeholder="Nghỉ ngơi, uống nhiều nước..."
                />
                </div>

                <div className="form-group">
                <label>Kê đơn thuốc (Tùy chọn)</label>
                <div className="med-row">
                    <input placeholder="Tên thuốc" className="form-control" style={{flex:2}}
                    value={medInput.name} onChange={e => setMedInput({...medInput, name: e.target.value})} />
                    <input type="number" placeholder="SL" className="form-control" style={{width:'80px'}}
                    value={medInput.quantity} onChange={e => setMedInput({...medInput, quantity: e.target.value})} />
                    <input placeholder="Cách dùng" className="form-control" style={{flex:1}}
                    value={medInput.usage} onChange={e => setMedInput({...medInput, usage: e.target.value})} />
                    <button className="btn-add" onClick={addMed}>+</button>
                </div>

                <ul className="med-list">
                    {prescriptions.map(item => (
                    <li key={item.id}>
                        <span>💊 <b>{item.name}</b> (x{item.quantity}) - {item.usage}</span>
                        <span className="btn-remove" onClick={() => removeMed(item.id)}>×</span>
                    </li>
                    ))}
                </ul>
                </div>

                <button className="btn-submit" onClick={handleSubmit}>HOÀN TẤT KHÁM BỆNH</button>
            </>
            )}
        </div>
        </div>
    );
    };

export default DoctorDashboard;