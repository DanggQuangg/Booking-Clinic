import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  UserRound,
  CalendarDays,
  Stethoscope,
  Clock,
  ShieldCheck,
  Plus,
  X,
  Phone,
  IdCard,
  MapPin,
  Users,
} from "lucide-react";

import Header from "../components/Header";
import { http } from "../api/http";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const overlayV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const modalV = {
  hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    filter: "blur(2px)",
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.18, delay: i * 0.05, ease: "easeOut" },
  }),
};

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function Pill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-extrabold ring-1 ring-white/15 text-white/90">
      <span className="text-white/80">{icon}</span>
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  disabled,
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-1">{label}</div>
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none transition",
            icon ? "pl-10" : "",
            "focus:ring-2 focus:ring-emerald-200 focus:border-emerald-200",
            "disabled:bg-slate-50 disabled:cursor-not-allowed",
          ].join(" ")}
        />
      </div>
    </label>
  );
}

/** ✅ Helper: map 401/403 => "Hãy đăng nhập..." */
function getErrMsg(e) {
  const status = e?.response?.status;

  // Chưa đăng nhập / token hết hạn / bị chặn bởi security
  if (status === 401 || status === 403) {
    return "Hãy đăng nhập để tiếp tục.";
  }

  // Backend trả message
  const msg = e?.response?.data?.message;
  if (msg) return msg;

  // fallback
  return e?.message || "Lỗi không xác định";
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
        setError(getErrMsg(e));
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
      setError(getErrMsg(e));
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
      setCreateErr(getErrMsg(e));
    } finally {
      setCreating(false);
    }
  };

  const selected = useMemo(() => {
    if (!selectedProfileId) return null;
    return profiles.find((p) => String(p.id) === String(selectedProfileId)) || null;
  }, [profiles, selectedProfileId]);

  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-[calc(100vh-110px)]">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {/* HERO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl overflow-hidden border border-slate-200/60 shadow-[0_20px_70px_-45px_rgba(2,6,23,0.45)]"
          >
            <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Đặt lịch khám • Bước 4/4
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-black">
                    Chọn hồ sơ & xác nhận
                  </h1>

                  <p className="mt-2 text-white/85 text-sm md:text-base">
                    Kiểm tra thông tin và chọn hồ sơ bệnh nhân trước khi đặt lịch.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill icon={<Stethoscope className="h-3.5 w-3.5" />}>
                      Chuyên khoa: <b className="text-white">#{specialtyId}</b>
                    </Pill>
                    <Pill icon={<Users className="h-3.5 w-3.5" />}>
                      Bác sĩ: <b className="text-white">#{doctorId}</b>
                    </Pill>
                    <Pill icon={<CalendarDays className="h-3.5 w-3.5" />}>
                      Ngày: <b className="text-white">{fmtDate(date)}</b>
                    </Pill>
                    <Pill icon={<Clock className="h-3.5 w-3.5" />}>
                      Slot: <b className="text-white">#{slotId}</b>
                    </Pill>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-2.5 font-extrabold ring-1 ring-white/25 active:scale-[0.99] transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </button>
              </div>
            </div>

            <div className="bg-white px-6 py-3 text-sm text-slate-600 flex items-center justify-between gap-3">
              <span>
                <b className="text-slate-900">Bước 4:</b> Chọn hồ sơ & xác nhận đặt lịch
              </span>
              <span className="hidden sm:inline-flex font-bold text-slate-500">
                {loading ? "Đang tải…" : `${profiles.length} hồ sơ`}
              </span>
            </div>
          </motion.div>

          {/* CONTENT */}
          <div className="mt-6 grid lg:grid-cols-12 gap-4">
            {/* LEFT: profiles */}
            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="show"
              className="lg:col-span-8 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-extrabold text-slate-900 inline-flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-slate-500" />
                  Chọn hồ sơ bệnh nhân
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2.5 font-extrabold hover:bg-emerald-700 active:scale-[0.99] transition"
                >
                  <Plus className="h-4 w-4" />
                  Tạo hồ sơ mới
                </button>
              </div>

              {loading ? (
                <div className="text-slate-600 mt-4">Đang tải hồ sơ...</div>
              ) : profiles.length === 0 ? (
                <div className="text-slate-700 mt-4">
                  Bạn chưa có hồ sơ bệnh nhân. Bấm <b>+ Tạo hồ sơ mới</b> để tạo.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {profiles.map((p, idx) => {
                    const active = String(selectedProfileId) === String(p.id);
                    return (
                      <motion.label
                        key={p.id}
                        variants={fadeUp}
                        custom={idx}
                        initial="hidden"
                        animate="show"
                        className={[
                          "flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition",
                          active
                            ? "border-sky-300 ring-2 ring-sky-200 bg-sky-50"
                            : "border-slate-200/70 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="profile"
                          className="mt-1"
                          checked={String(selectedProfileId) === String(p.id)}
                          onChange={() => {
                            setError("");
                            setSelectedProfileId(p.id);
                          }}
                        />

                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900">
                            {p.fullName}{" "}
                            {p.isDefault ? (
                              <span className="text-xs text-emerald-700 font-extrabold">
                                • Mặc định
                              </span>
                            ) : null}
                          </div>

                          <div className="text-slate-600 text-sm mt-1">
                            SĐT: <b className="text-slate-800">{p.phone || "—"}</b> • DOB:{" "}
                            <b className="text-slate-800">{p.dob || "—"}</b> • Giới tính:{" "}
                            <b className="text-slate-800">{p.gender || "—"}</b>
                          </div>

                          <div className="text-slate-600 text-sm mt-1">
                            CCCD: <b className="text-slate-800">{p.citizenId || "—"}</b> • BHYT:{" "}
                            <b className="text-slate-800">
                              {p.healthInsuranceCode || "—"}
                            </b>
                          </div>

                          <div className="text-slate-600 text-sm mt-1">
                            Dân tộc: <b className="text-slate-800">{p.ethnicity || "—"}</b> • Địa chỉ:{" "}
                            <b className="text-slate-800">{p.address || "—"}</b>
                          </div>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>
              )}

              {error ? (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold inline-flex gap-2"
                >
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  {error}
                </motion.div>
              ) : null}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={submitting || !selectedProfileId}
                  onClick={onConfirm}
                  className="rounded-2xl bg-sky-600 text-white px-6 py-3 font-extrabold hover:bg-sky-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch →"}
                </button>
              </div>
            </motion.div>

            {/* RIGHT: summary */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="lg:col-span-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
            >
              <div className="font-extrabold text-slate-900">Tóm tắt</div>

              <div className="mt-3 grid gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                  <div className="text-xs font-bold text-slate-500">Lịch khám</div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    CK #{specialtyId} • BS #{doctorId}
                  </div>
                  <div className="mt-1 text-slate-700">
                    Ngày <b>{fmtDate(date)}</b> • Slot <b>#{slotId}</b>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                  <div className="text-xs font-bold text-slate-500">Hồ sơ đã chọn</div>
                  {selected ? (
                    <div className="mt-1">
                      <div className="font-extrabold text-slate-900">{selected.fullName}</div>
                      <div className="text-slate-700 mt-1 inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        {selected.phone || "—"}
                      </div>
                      <div className="text-slate-700 mt-1 inline-flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-slate-500" />
                        {selected.citizenId || "—"}
                      </div>
                      <div className="text-slate-700 mt-1 inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                        {selected.healthInsuranceCode || "—"}
                      </div>
                      <div className="text-slate-700 mt-1 inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        {selected.address || "—"}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-slate-600 font-semibold">Chưa chọn hồ sơ</div>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Ghi chú: hiện đang gửi <b>insuranceUsed=false</b> theo logic của bạn.
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* MODAL CREATE PROFILE */}
        <AnimatePresence>
          {showCreate ? (
            <div className="fixed inset-0 z-50">
              <motion.div
                variants={overlayV}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute inset-0 bg-black/45"
                onMouseDown={() => setShowCreate(false)}
                aria-hidden="true"
              />

              <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                <motion.div
                  variants={modalV}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="w-full max-w-2xl"
                  onMouseDown={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_70px_-35px_rgba(2,6,23,0.45)] overflow-hidden">
                    {/* Modal header */}
                    <div className="relative px-6 pt-6 pb-5 border-b border-slate-200/70 bg-gradient-to-b from-emerald-50 to-white">
                      <div className="pr-10">
                        <div className="text-xl font-extrabold text-slate-900">
                          Tạo hồ sơ bệnh nhân
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Nhập thông tin cơ bản để đặt lịch nhanh hơn.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        className="absolute right-4 top-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 active:scale-[0.98] transition"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Modal body */}
                    <div className="px-6 py-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field
                          label="Họ tên *"
                          value={form.fullName}
                          onChange={(v) => setForm({ ...form, fullName: v })}
                          placeholder="Nguyễn Văn A"
                          icon={<UserRound className="h-4 w-4" />}
                          disabled={creating}
                        />
                        <Field
                          label="Số điện thoại"
                          value={form.phone}
                          onChange={(v) => setForm({ ...form, phone: v })}
                          placeholder="09xxxxxxxx"
                          icon={<Phone className="h-4 w-4" />}
                          disabled={creating}
                        />

                        <Field
                          label="Ngày sinh"
                          type="date"
                          value={form.dob}
                          onChange={(v) => setForm({ ...form, dob: v })}
                          icon={<CalendarDays className="h-4 w-4" />}
                          disabled={creating}
                        />

                        <label className="block">
                          <div className="text-sm font-semibold text-slate-700 mb-1">
                            Giới tính
                          </div>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            disabled={creating}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none
                                       focus:ring-2 focus:ring-emerald-200 focus:border-emerald-200 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                          >
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </label>

                        <Field
                          label="CCCD"
                          value={form.citizenId}
                          onChange={(v) => setForm({ ...form, citizenId: v })}
                          placeholder="012345678901"
                          icon={<IdCard className="h-4 w-4" />}
                          disabled={creating}
                        />
                        <Field
                          label="Mã BHYT"
                          value={form.healthInsuranceCode}
                          onChange={(v) => setForm({ ...form, healthInsuranceCode: v })}
                          placeholder="BHYT..."
                          icon={<ShieldCheck className="h-4 w-4" />}
                          disabled={creating}
                        />

                        <Field
                          label="Dân tộc"
                          value={form.ethnicity}
                          onChange={(v) => setForm({ ...form, ethnicity: v })}
                          placeholder="Kinh"
                          icon={<Users className="h-4 w-4" />}
                          disabled={creating}
                        />
                        <Field
                          label="Địa chỉ"
                          value={form.address}
                          onChange={(v) => setForm({ ...form, address: v })}
                          placeholder="Số nhà, đường, phường/xã..."
                          icon={<MapPin className="h-4 w-4" />}
                          disabled={creating}
                        />
                      </div>

                      <label className="flex items-center gap-2 mt-4 text-slate-700 font-semibold">
                        <input
                          type="checkbox"
                          checked={form.isDefault}
                          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                          disabled={creating}
                        />
                        Đặt làm hồ sơ mặc định
                      </label>

                      {createErr ? (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold inline-flex gap-2"
                        >
                          <AlertTriangle className="h-5 w-5 mt-0.5" />
                          {createErr}
                        </motion.div>
                      ) : null}

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowCreate(false)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-extrabold text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition"
                          disabled={creating}
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          disabled={creating}
                          onClick={createProfile}
                          className="rounded-2xl bg-emerald-600 text-white px-5 py-2.5 font-extrabold hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-50"
                        >
                          {creating ? "Đang tạo..." : "Tạo hồ sơ"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : null}
        </AnimatePresence>
      </main>
    </>
  );
}
