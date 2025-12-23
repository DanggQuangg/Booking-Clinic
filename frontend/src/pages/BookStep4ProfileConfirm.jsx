import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { http } from "../api/http";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function BookStep4ProfileConfirm() {
  const q = useQuery();
  const specialtyId = q.get("specialtyId");
  const date = q.get("date");
  const doctorId = q.get("doctorId");
  const slotId = q.get("slotId");

  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // modal create profile
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  // ✅ mở rộng theo patient_profiles (SQL)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    dob: "",
    gender: "MALE",
    citizenId: "",
    healthInsuranceCode: "",
    address: "",
    ethnicity: "",
    isDefault: false,
  });

  const loadProfiles = async () => {
    const res = await http.get("/api/patient/profiles");
    const data = res.data;

    const arr = Array.isArray(data) ? data : [];
    setProfiles(arr);

    const def = arr.find((x) => x.isDefault);
    setSelectedProfileId(def ? def.id : arr[0]?.id ?? null);
  };

  useEffect(() => {
    if (!specialtyId || !date || !doctorId || !slotId) {
      setLoading(false);
      setError("Thiếu tham số. Hãy quay lại bước trước.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        await loadProfiles();
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyId, date, doctorId, slotId]);

  const onConfirm = async () => {
    if (!selectedProfileId) {
      setError("Bạn chưa chọn hồ sơ.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const body = {
        patientProfileId: Number(selectedProfileId),
        specialtyId: Number(specialtyId),
        doctorId: Number(doctorId),
        slotId: Number(slotId),
        appointmentDate: date,
        insuranceUsed: false,
        insuranceDiscount: null,
        note: "",
      };

      const res = await http.post("/api/patient/appointments", body);
      const data = res.data;
      navigate(`/book/invoice?appointmentId=${data.appointmentId}`);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setCreateErr("");
    setForm({
      fullName: "",
      phone: "",
      dob: "",
      gender: "MALE",
      citizenId: "",
      healthInsuranceCode: "",
      address: "",
      ethnicity: "",
      isDefault: false,
    });
    setShowCreate(true);
  };

  const createProfile = async () => {
    if (!form.fullName.trim()) {
      setCreateErr("Vui lòng nhập họ tên.");
      return;
    }

    try {
      setCreating(true);
      setCreateErr("");

      // ✅ payload mở rộng (cần backend hỗ trợ thêm field — xem phần 2)
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,

        citizenId: form.citizenId.trim() || null,
        healthInsuranceCode: form.healthInsuranceCode.trim() || null,
        address: form.address.trim() || null,
        ethnicity: form.ethnicity.trim() || null,

        isDefault: !!form.isDefault,
      };

      const res = await http.post("/api/patient/profiles", payload);
      const created = res.data;

      await loadProfiles();
      if (created?.id) setSelectedProfileId(created.id);

      setShowCreate(false);
    } catch (e) {
      setCreateErr(e?.response?.data?.message || e?.message || "Lỗi không xác định");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Đặt lịch khám</h1>
            <p className="text-slate-600 mt-1">Bước 4: Chọn hồ sơ & xác nhận</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Quay lại
          </button>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="font-extrabold text-slate-900">Thông tin lịch khám</div>
          <div className="text-slate-700 mt-2">
            Chuyên khoa: <b>#{specialtyId}</b> • Bác sĩ: <b>#{doctorId}</b> • Ngày: <b>{date}</b> • Slot: <b>#{slotId}</b>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-extrabold text-slate-900">Chọn hồ sơ bệnh nhân</div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-extrabold hover:bg-emerald-700"
            >
              + Tạo hồ sơ mới
            </button>
          </div>

          {loading ? (
            <div className="text-slate-600 mt-3">Đang tải hồ sơ...</div>
          ) : profiles.length === 0 ? (
            <div className="text-slate-700 mt-3">
              Bạn chưa có hồ sơ bệnh nhân. Bấm <b>+ Tạo hồ sơ mới</b> để tạo.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {profiles.map((p) => (
                <label key={p.id} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profile"
                    checked={String(selectedProfileId) === String(p.id)}
                    onChange={() => setSelectedProfileId(p.id)}
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900">
                      {p.fullName}{" "}
                      {p.isDefault ? <span className="text-xs text-emerald-700">• Mặc định</span> : null}
                    </div>

                    <div className="text-slate-600 text-sm mt-1">
                      SĐT: {p.phone || "—"} • DOB: {p.dob || "—"} • Giới tính: {p.gender || "—"}
                    </div>

                    {/* ✅ hiển thị thêm info theo patient_profiles */}
                    <div className="text-slate-600 text-sm mt-1">
                      CCCD: {p.citizenId || "—"} • BHYT: {p.healthInsuranceCode || "—"}
                    </div>
                    <div className="text-slate-600 text-sm mt-1">
                      Dân tộc: {p.ethnicity || "—"} • Địa chỉ: {p.address || "—"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">{error}</div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={submitting || !selectedProfileId}
              onClick={onConfirm}
              className="rounded-xl bg-sky-600 text-white px-5 py-3 font-extrabold hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch →"}
            </button>
          </div>
        </div>

        {/* MODAL CREATE PROFILE */}
        {showCreate ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg rounded-2xl bg-white border p-5">
              <div className="flex items-center justify-between">
                <div className="text-lg font-extrabold text-slate-900">Tạo hồ sơ bệnh nhân</div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border px-3 py-1 font-bold text-slate-700 hover:bg-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Họ tên *</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="09xxxxxxxx"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Giới tính</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                {/* ✅ thêm field theo patient_profiles */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">CCCD</label>
                    <input
                      value={form.citizenId}
                      onChange={(e) => setForm({ ...form, citizenId: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="012345678901"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mã BHYT</label>
                    <input
                      value={form.healthInsuranceCode}
                      onChange={(e) => setForm({ ...form, healthInsuranceCode: e.target.value })}
                      className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="BHYT..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dân tộc</label>
                  <input
                    value={form.ethnicity}
                    onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Kinh"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Địa chỉ</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                  />
                </div>

                <label className="flex items-center gap-2 mt-2 text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  Đặt làm hồ sơ mặc định
                </label>

                {createErr ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">
                    {createErr}
                  </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-xl border px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={createProfile}
                    className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-extrabold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {creating ? "Đang tạo..." : "Tạo hồ sơ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
