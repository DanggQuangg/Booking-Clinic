import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ArrowLeft,
  Search,
  XCircle,
  Stethoscope,
  BadgeCheck,
  ArrowRight,
  Users,
} from "lucide-react";
import Header from "../components/Header";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function moneyVND(n) {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " đ";
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

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden">
      <div className="flex items-start gap-3 animate-pulse">
        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="mt-4 h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
      <div className="mt-3 h-10 w-full bg-slate-200 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function BookStep2DateDoctor() {
  const q = useQuery();
  const specialtyId = q.get("specialtyId");
  const navigate = useNavigate();

  const today = new Date();
  const minDate = formatDateISO(today);

  // default: ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [date, setDate] = useState(formatDateISO(tomorrow));
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  // UI-only search
  const [nameQ, setNameQ] = useState("");

  const loadDoctors = async (spId, dt) => {
    if (!spId || !dt) return;
    try {
      setLoading(true);
      setError("");
      setDoctors([]);

      // ✅ GIỮ LOGIC GỐC
      const res = await fetch(
        `/api/public/doctors/available?specialtyId=${spId}&date=${dt}`
      );
      if (!res.ok) throw new Error("Không tải được danh sách bác sĩ.");
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // load lần đầu + khi đổi specialtyId
  useEffect(() => {
    if (!specialtyId) {
      setError("Thiếu specialtyId. Hãy quay lại bước 1.");
      return;
    }
    loadDoctors(specialtyId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyId]);

  // khi đổi ngày => reload doctors
  useEffect(() => {
    if (!specialtyId || !date) return;
    loadDoctors(specialtyId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const onPickDoctor = (doctorId) => {
    // ✅ GIỮ LOGIC GỐC
    navigate(
      `/book/step3?specialtyId=${specialtyId}&date=${date}&doctorId=${doctorId}`
    );
  };

  const filteredDoctors = useMemo(() => {
    const key = nameQ.trim().toLowerCase();
    if (!key) return doctors;
    return doctors.filter((d) =>
      String(d?.fullName || "").toLowerCase().includes(key)
    );
  }, [doctors, nameQ]);

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
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">
                    <CalendarDays className="h-4 w-4" />
                    Đặt lịch khám • Bước 2/4
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-black">
                    Chọn ngày & bác sĩ
                  </h1>

                  <p className="mt-2 text-white/85 text-sm md:text-base">
                    Chuyên khoa #{specialtyId || "?"} • Chọn ngày để hệ thống tải danh sách bác sĩ khả dụng.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/85">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                      <Users className="h-3.5 w-3.5" />
                      {loading ? "Đang tải…" : `Có ${filteredDoctors.length} bác sĩ`}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Ngày: <b className="text-white">{date}</b>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/book")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-2.5 font-extrabold ring-1 ring-white/25 active:scale-[0.99] transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại bước 1
                </button>
              </div>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Date picker */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-white/85 mb-1">
                    Chọn ngày khám
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={minDate}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-2xl bg-white text-slate-900 px-4 py-3 font-semibold outline-none
                                 ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
                    />
                  </div>
                  <div className="text-white/80 text-xs mt-2">
                    Đổi ngày sẽ tự tải lại bác sĩ khả dụng.
                  </div>
                </div>

                {/* Search */}
                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-white/85 mb-1">
                    Tìm theo tên bác sĩ (lọc nhanh)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      value={nameQ}
                      onChange={(e) => setNameQ(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A…"
                      className="w-full rounded-2xl bg-white text-slate-900 pl-10 pr-10 py-3 font-semibold outline-none
                                 ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
                    />
                    {nameQ ? (
                      <button
                        type="button"
                        onClick={() => setNameQ("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Clear"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-3 text-sm text-slate-600 flex items-center justify-between gap-3">
              <span>
                <b className="text-slate-900">Bước 2:</b> Chọn ngày & bác sĩ →{" "}
                <span className="text-slate-500">Bước 3: Chọn giờ</span>
              </span>
              <span className="hidden sm:inline-flex font-bold text-slate-500">
                {loading ? "Đang tải…" : `Hiển thị: ${filteredDoctors.length}`}
              </span>
            </div>
          </motion.div>

          {/* LIST */}
          <div className="mt-6">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    initial="hidden"
                    animate="show"
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold"
              >
                {error}
              </motion.div>
            ) : doctors.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
              >
                Không có bác sĩ khả dụng cho ngày <b>{date}</b>.
                <br />
                <div className="mt-2 text-slate-700">
                  Hãy kiểm tra dữ liệu <b>doctor_work_shifts</b> (status != CANCELLED) của ngày này,
                  và các slot sinh ra trong <b>appointment_slots</b> (status = ACTIVE).
                </div>
              </motion.div>
            ) : filteredDoctors.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
              >
                <div className="font-extrabold text-slate-900">Không tìm thấy bác sĩ</div>
                <div className="text-slate-600 text-sm mt-1">
                  Hãy thử từ khóa khác hoặc xóa tìm kiếm.
                </div>
                <button
                  type="button"
                  onClick={() => setNameQ("")}
                  className="mt-4 rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white hover:bg-sky-700 active:scale-[0.99] transition"
                >
                  Xóa tìm kiếm
                </button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredDoctors.map((d, idx) => (
                    <motion.button
                      key={d.doctorId}
                      type="button"
                      onClick={() => onPickDoctor(d.doctorId)}
                      variants={fadeUp}
                      custom={idx}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="text-left rounded-3xl border border-slate-200/70 bg-white p-5
                                 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]
                                 hover:shadow-[0_20px_60px_-35px_rgba(2,6,23,0.35)]
                                 transition overflow-hidden group"
                    >
                      <motion.div variants={pop} className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                          {d.avatarUrl ? (
                            <img
                              src={d.avatarUrl}
                              alt={d.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 truncate">
                            {d.fullName}
                            {d.isVerified ? (
                              <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                                <BadgeCheck className="h-4 w-4" />
                                Verified
                              </span>
                            ) : null}
                          </div>

                          <div className="text-slate-600 text-sm truncate mt-0.5">
                            {d.degree || "—"} • {d.positionTitle || "—"}
                          </div>
                        </div>
                      </motion.div>

                      <div className="mt-4 text-slate-700 text-sm">
                        Phí khám:{" "}
                        <span className="font-extrabold text-slate-900">
                          {moneyVND(d.consultationFee)}
                        </span>
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 text-sky-700 font-extrabold text-sm">
                        Chọn bác sĩ
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
