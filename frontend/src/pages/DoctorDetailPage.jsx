import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  BadgeCheck,
  CalendarDays,
  PhoneCall,
  Mail,
  UserRound,
  Cake,
  Clock,
  DoorOpen,
  ChevronDown,
  Info,
} from "lucide-react";

import Header from "../components/Header";
import { apiGet } from "../lib/api";

const fallbackAvatar =
  "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=600&auto=format&fit=crop&q=60";

function moneyVND(n) {
  if (n == null) return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " đ";
}

const SHIFT_LABEL = {
  MORNING: "Sáng",
  AFTERNOON: "Chiều",
};

function dowVi(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const map = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return map[d.getDay()];
}

function fmtDate(dateStr) {
  const [y, m, d] = String(dateStr).split("-");
  return `${d}/${m}/${y}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.18, delay: i * 0.05, ease: "easeOut" },
  }),
};

const pop = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.16, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: "easeIn" } },
};

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ lấy specialtyId từ query để chuyển sang BookStep4ProfileConfirm
  const [searchParams] = useSearchParams();
  const specialtyId = searchParams.get("specialtyId"); // có thể null

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);

  // accordion open state (UI only)
  const [openDates, setOpenDates] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    apiGet(`/api/public/doctors/${id}`)
      .then((data) => mounted && setDoctor(data))
      .catch((e) => mounted && setError(e?.message || "Không tải được hồ sơ bác sĩ"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  // ✅ group lịch theo ngày (doctor.schedule do backend trả)
  const groupedSchedule = useMemo(() => {
    const items = doctor?.schedule || [];
    const map = new Map();

    for (const it of items) {
      const key = it.workDate;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => String(a.shift).localeCompare(String(b.shift)));
      map.set(k, arr);
    }

    return Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  }, [doctor]);

  // set default open first 1-2 dates after load (UI only)
  useEffect(() => {
    if (!groupedSchedule?.length) return;
    setOpenDates((prev) => {
      if (prev.size > 0) return prev; // không ghi đè nếu user đã mở/đóng
      const s = new Set();
      s.add(groupedSchedule[0][0]);
      if (groupedSchedule[1]) s.add(groupedSchedule[1][0]);
      return s;
    });
  }, [groupedSchedule]);

  const toggleDate = (date) => {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // ✅ click slot → đi BookStep4ProfileConfirm
  const onPickSlot = (workDate, slotId) => {
    if (!doctor?.id) return;

    if (!specialtyId) {
      alert("Thiếu specialtyId. Hãy vào trang bác sĩ từ bước chọn chuyên khoa (có ?specialtyId=...).");
      return;
    }

    const url =
      `/book/confirm` +
      `?specialtyId=${encodeURIComponent(specialtyId)}` +
      `&date=${encodeURIComponent(workDate)}` +
      `&doctorId=${encodeURIComponent(doctor.id)}` +
      `&slotId=${encodeURIComponent(slotId)}`;

    navigate(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Top actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2 font-extrabold text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2 font-extrabold text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition"
          >
            <Users className="h-4 w-4" />
            Danh sách bác sĩ
          </Link>
        </motion.div>

        {/* Loading / Error */}
        {loading ? (
          <div className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]">
            <div className="flex gap-4 animate-pulse">
              <div className="h-20 w-20 rounded-3xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-5 w-1/2 bg-slate-200 rounded" />
                <div className="mt-2 h-4 w-1/3 bg-slate-200 rounded" />
                <div className="mt-3 h-10 w-44 bg-slate-200 rounded-2xl" />
              </div>
            </div>
            <div className="mt-6 h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            <div className="mt-2 h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
            {error}
          </div>
        ) : !doctor ? (
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4 font-semibold">
            Không tìm thấy bác sĩ.
          </div>
        ) : (
          <>
            {/* HERO CARD */}
            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-3xl overflow-hidden border border-slate-200/60 shadow-[0_20px_70px_-45px_rgba(2,6,23,0.45)]"
            >
              <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <img
                    src={doctor.avatarUrl || fallbackAvatar}
                    onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                    alt={doctor.fullName}
                    className="h-24 w-24 rounded-3xl object-cover border border-white/25 shadow-sm"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-black truncate">{doctor.fullName}</h1>
                      {doctor.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/25 font-extrabold">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-white/90 font-semibold">
                      {doctor.degree || "Bác sĩ"} {doctor.positionTitle ? `• ${doctor.positionTitle}` : ""}
                    </div>

                    {/* specialties */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(doctor.specialties || []).map((s) => (
                        <span
                          key={s.id}
                          className="text-xs px-3 py-1 rounded-full bg-white/15 text-white font-bold ring-1 ring-white/20"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* CTA row */}
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-3">
                        <div className="text-xs text-white/85 font-bold">Phí khám</div>
                        <div className="text-lg font-black">{moneyVND(doctor.consultationFee)}</div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {/* giữ link cũ */}
                        <Link
                          to="/book"
                          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-extrabold bg-white text-slate-900 hover:bg-white/90 active:scale-[0.99] transition"
                        >
                          <CalendarDays className="h-5 w-5" />
                          Đặt lịch khám
                        </Link>

                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-extrabold bg-slate-900/80 text-white hover:bg-slate-900 active:scale-[0.99] transition ring-1 ring-white/20"
                        >
                          <PhoneCall className="h-5 w-5" />
                          Liên hệ
                        </Link>
                      </div>
                    </div>

                    {!specialtyId ? (
                      <div className="mt-4 rounded-2xl bg-amber-50 text-amber-900 ring-1 ring-amber-200 px-4 py-3 font-semibold">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 mt-0.5" />
                          <div>
                             Đặt lịch bằng cách nhấn đặt lịch khám
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Quick info panel */}
                  <div className="md:w-72 rounded-3xl bg-white text-slate-900 p-4 ring-1 ring-white/25">
                    <div className="text-xs font-black text-slate-500">THÔNG TIN</div>

                    <div className="mt-3 grid gap-2 text-sm">
                      <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={doctor.email || "—"} />
                      <InfoRow
                        icon={<UserRound className="h-4 w-4" />}
                        label="Giới tính"
                        value={doctor.gender || "—"}
                      />
                      <InfoRow icon={<Cake className="h-4 w-4" />} label="Ngày sinh" value={doctor.dob || "—"} />
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      (* Có thể ẩn/sửa tuỳ chính sách hiển thị)
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BIO */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
            >
              <div className="text-lg font-black text-slate-900">Giới thiệu</div>
              <div className="mt-2 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {doctor.bio || "Chưa có thông tin giới thiệu."}
              </div>
            </motion.div>

            {/* SCHEDULE */}
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-slate-900">Lịch khám sắp tới</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Lịch lấy từ <b>doctor_work_shifts</b> + <b>appointment_slots</b> (14 ngày tới).
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Nhấn vào <b>khung giờ</b> để chuyển sang bước chọn hồ sơ & xác nhận đặt lịch.
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-slate-600">
                  <Clock className="h-4 w-4" />
                  14 ngày
                </div>
              </div>

              {groupedSchedule.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 font-semibold text-slate-700">
                  Chưa có ca làm nào trong 14 ngày tới.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4">
                  {groupedSchedule.map(([date, shifts], idx) => {
                    const opened = openDates.has(date);

                    return (
                      <div key={date} className="rounded-3xl border border-slate-200/70 bg-slate-50 overflow-hidden">
                        {/* Date header (accordion) */}
                        <button
                          type="button"
                          onClick={() => toggleDate(date)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-100 transition"
                        >
                          <div className="min-w-0">
                            <div className="font-black text-slate-900">
                              {dowVi(date)} • {fmtDate(date)}
                            </div>
                            <div className="text-xs text-slate-600 font-bold mt-0.5">
                              {shifts.length} ca • {opened ? "Đang mở" : "Đang đóng"}
                            </div>
                          </div>

                          <ChevronDown
                            className={`h-5 w-5 text-slate-600 transition ${opened ? "rotate-180" : ""}`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {opened && (
                            <motion.div
                              variants={pop}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              className="px-4 pb-4"
                            >
                              <div className="grid gap-3">
                                {shifts.map((ws) => (
                                  <div key={ws.workShiftId} className="rounded-2xl bg-white border border-slate-200/70 p-3">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                      <div className="font-extrabold text-slate-900 inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-500" />
                                        {SHIFT_LABEL[ws.shift] || ws.shift} •{" "}
                                        {String(ws.doctorStartTime).slice(0, 5)} -{" "}
                                        {String(ws.doctorEndTime).slice(0, 5)}
                                      </div>

                                      <div className="text-xs text-slate-600 font-bold inline-flex items-center gap-2">
                                        <DoorOpen className="h-4 w-4" />
                                        Phòng {ws.roomName || ws.roomId || "—"}
                                      </div>
                                    </div>

                                    {/* slots */}
                                    {!ws.slots || ws.slots.length === 0 ? (
                                      <div className="mt-2 text-sm text-slate-500 font-semibold">
                                        (Chưa sinh slot)
                                      </div>
                                    ) : (
                                      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                        {ws.slots.map((s) => {
                                          const disabled =
                                            s.status !== "ACTIVE" ||
                                            (s.capacity ?? 0) <= 0 ||
                                            !specialtyId;

                                          return (
                                            <button
                                              key={s.id}
                                              type="button"
                                              disabled={disabled}
                                              onClick={() => onPickSlot(ws.workDate, s.id)}
                                              className={[
                                                "rounded-2xl border px-3 py-2 text-sm font-extrabold text-left transition",
                                                disabled
                                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                                                  : "bg-white hover:bg-slate-50 border-slate-200 active:scale-[0.99]",
                                              ].join(" ")}
                                              title={
                                                !specialtyId
                                                  ? "Thiếu specialtyId trên URL"
                                                  : disabled
                                                  ? "Slot không khả dụng"
                                                  : `Đặt lịch - Slot #${s.id}`
                                              }
                                            >
                                              {String(s.startTime).slice(0, 5)} -{" "}
                                              {String(s.endTime).slice(0, 5)}
                                              <div className="text-xs font-bold text-slate-600 mt-1">
                                                {s.capacity ?? "—"} suất
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* hint */}
                              {idx === 0 ? (
                                <div className="mt-3 text-xs text-slate-500">
                                  Tip: Bạn có thể mở/đóng từng ngày để xem lịch nhanh hơn.
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-slate-600 font-bold inline-flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="text-slate-900 font-extrabold text-right break-all">{value}</div>
    </div>
  );
}
