import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Header from "../components/Header";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
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

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden">
      <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
      <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
      <div className="mt-3 h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
      <div className="mt-4 h-10 w-full bg-slate-200 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function BookStep3Slot() {
  const q = useQuery();
  const specialtyId = q.get("specialtyId");
  const date = q.get("date");
  const doctorId = q.get("doctorId");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  useEffect(() => {
    if (!specialtyId || !date || !doctorId) {
      setLoading(false);
      setError("Thiếu specialtyId/date/doctorId. Hãy quay lại bước trước.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        setSlots([]);
        setSelectedSlotId(null);

        // ✅ GIỮ ĐÚNG LOGIC GỐC CỦA BẠN
        const res = await fetch(`/api/public/doctors/${doctorId}/slots?date=${date}`);
        if (!res.ok) throw new Error("Không tải được danh sách giờ khám.");
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [specialtyId, date, doctorId]);

  const onNext = () => {
    if (!selectedSlotId) {
      setError("Bạn chưa chọn giờ khám.");
      return;
    }
    navigate(
      `/book/step4?specialtyId=${specialtyId}&date=${date}&doctorId=${doctorId}&slotId=${selectedSlotId}`
    );
  };

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return slots.find((s) => String(s.slotId) === String(selectedSlotId)) || null;
  }, [slots, selectedSlotId]);

  return (
    <>
      <Header />

      <main className="bg-slate-50 min-h-[calc(100vh-110px)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* HERO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl overflow-hidden border border-slate-200/60 shadow-[0_20px_70px_-45px_rgba(2,6,23,0.45)]"
          >
            <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">
                    <Clock className="h-4 w-4" />
                    Đặt lịch khám • Bước 3/4
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-black">
                    Chọn giờ khám
                  </h1>

                  <p className="mt-2 text-white/85 text-sm md:text-base">
                    Ngày khám: <b className="text-white">{fmtDate(date)}</b> • Doctor ID:{" "}
                    <b className="text-white">{doctorId}</b>
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-white/85 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {loading ? "Đang tải…" : `Có ${slots.length} slot`}
                  </div>
                </div>

                {/* ✅ GIỮ LOGIC BACK STEP2: /book/step2?specialtyId=... */}
                <button
                  type="button"
                  onClick={() => navigate(`/book/step2?specialtyId=${specialtyId}`)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-2.5 font-extrabold ring-1 ring-white/25 active:scale-[0.99] transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại bước 2
                </button>
              </div>
            </div>

            <div className="bg-white px-6 py-3 text-sm text-slate-600">
              <b className="text-slate-900">Bước 3:</b> Chọn giờ khám →{" "}
              <span className="text-slate-500">Bước 4: Xác nhận</span>
            </div>
          </motion.div>

          {/* BODY */}
          <div className="mt-6">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="show">
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold inline-flex gap-2"
              >
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                {error}
              </motion.div>
            ) : slots.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
              >
                Bác sĩ này không có slot ACTIVE cho ngày <b>{date}</b>.
              </motion.div>
            ) : (
              <>
                {/* Slots grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {slots.map((s, idx) => {
                      const disabled = Number(s.remaining) <= 0;
                      const active = String(selectedSlotId) === String(s.slotId);

                      return (
                        <motion.button
                          key={s.slotId}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setError("");
                            setSelectedSlotId(s.slotId);
                          }}
                          variants={fadeUp}
                          custom={idx}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          className={[
                            "text-left rounded-3xl border p-5 transition overflow-hidden",
                            disabled
                              ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                              : "bg-white border-slate-200/70 hover:shadow-[0_20px_60px_-35px_rgba(2,6,23,0.35)]",
                            active ? "ring-2 ring-sky-300 border-sky-300" : "",
                          ].join(" ")}
                        >
                          <motion.div variants={pop}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  {s.startTime} - {s.endTime}
                                </div>

                                <div className="text-slate-600 text-sm mt-1 inline-flex items-center gap-2">
                                  <DoorOpen className="h-4 w-4" />
                                  Phòng: <b className="text-slate-800">{s.roomName}</b>
                                </div>

                                <div className="text-slate-700 text-sm mt-2">
                                  Còn chỗ:{" "}
                                  <b className={disabled ? "text-slate-400" : "text-slate-900"}>
                                    {s.remaining}
                                  </b>{" "}
                                  / {s.capacity}
                                </div>
                              </div>

                              {active ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-extrabold">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Đã chọn
                                </span>
                              ) : (
                                <span
                                  className={[
                                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold border",
                                    disabled
                                      ? "bg-slate-100 text-slate-400 border-slate-200"
                                      : "bg-sky-50 text-sky-700 border-sky-100",
                                  ].join(" ")}
                                >
                                  {disabled ? "Hết chỗ" : "Chọn"}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Footer action */}
                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]">
                    <div className="text-xs font-bold text-slate-500">Đã chọn</div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {selectedSlot ? (
                        <>
                          {selectedSlot.startTime} - {selectedSlot.endTime} • Phòng{" "}
                          {selectedSlot.roomName}
                        </>
                      ) : (
                        "Chưa chọn khung giờ"
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onNext}
                    className="rounded-2xl bg-sky-600 text-white px-6 py-3 font-extrabold hover:bg-sky-700 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                  >
                    Tiếp tục
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
