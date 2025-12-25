import React, { useEffect, useState } from "react";
import doctorApi from "../../api/doctorApi";
import "./Doctor.css";

const DoctorProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    employmentType: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await doctorApi.getDashboardInfo();
        setForm({
          fullName: res?.fullName || "",
          specialization: res?.specialization || "",
          employmentType: res?.employmentType || "",
        });
      } catch (e) {
        setErr(e?.message || "Không tải được hồ sơ bác sĩ.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    try {
      setSaving(true);
      setErr("");

      // ✅ Bạn cần có API update profile tương ứng.
      // Nếu doctorApi.updateProfile chưa có, bạn tạo trong doctorApi trước (gợi ý phía dưới).
      await doctorApi.updateProfile({
        fullName: form.fullName,
        specialization: form.specialization,
      });

      alert("✅ Đã lưu hồ sơ!");
    } catch (e) {
      setErr(e?.response?.data || e?.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="doc-profile-page">
      <div className="doc-profile-card">
        <div className="doc-profile-head">
          <h2>Hồ sơ bác sĩ</h2>
          <p>Cập nhật thông tin hiển thị trên hệ thống.</p>
        </div>

        {loading ? (
          <div className="doc-profile-loading">Đang tải...</div>
        ) : (
          <>
            {err && <div className="doc-profile-error">{String(err)}</div>}

            <div className="doc-profile-grid">
              <div className="doc-field">
                <label>Họ và tên</label>
                <input
                  className="form-control"
                  value={form.fullName}
                  onChange={(e) => onChange("fullName", e.target.value)}
                  placeholder="VD: Trần Văn A"
                />
              </div>

              <div className="doc-field">
                <label>Chuyên khoa</label>
                <input
                  className="form-control"
                  value={form.specialization}
                  onChange={(e) => onChange("specialization", e.target.value)}
                  placeholder="VD: Nội tổng quát"
                />
              </div>

              <div className="doc-field">
                <label>Loại làm việc</label>
                <input
                  className="form-control"
                  value={
                    form.employmentType === "PART_TIME"
                      ? "Part-Time"
                      : form.employmentType === "FULL_TIME"
                      ? "Full-Time"
                      : form.employmentType || ""
                  }
                  disabled
                />
              </div>
            </div>

            <div className="doc-profile-actions">
              <button className="btn-primary" onClick={onSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
