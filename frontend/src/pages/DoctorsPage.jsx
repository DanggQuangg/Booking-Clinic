import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Filter,
  XCircle,
  BadgeCheck,
  Stethoscope,
  ArrowRight,
  UserRound,
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

const fadeUp = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.18, delay: i * 0.04, ease: "easeOut" },
  }),
};

const pop = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
};

function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/70 p-4 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 w-2/3 bg-slate-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          </div>
          <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-16 bg-slate-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="h-3 w-16 bg-slate-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          </div>
          <div className="mt-2 h-4 w-24 bg-slate-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          </div>
        </div>

        <div className="h-10 w-28 bg-slate-200 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
        </div>
      </div>

      <div className="mt-3 h-10 w-full bg-slate-200 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSpec, setLoadingSpec] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  // Load specialties
  useEffect(() => {
    let mounted = true;
    setLoadingSpec(true);
    apiGet("/api/public/specialties")
      .then((data) => {
        if (!mounted) return;
        setSpecialties(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setSpecialties([]);
      })
      .finally(() => mounted && setLoadingSpec(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Load doctors (server-side filter)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (specialtyId) params.set("specialtyId", specialtyId);
    if (q.trim()) params.set("q", q.trim());

    apiGet(`/api/public/doctors?${params.toString()}`)
      .then((data) => {
        if (!mounted) return;
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Không tải được danh sách bác sĩ");
        setDoctors([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [specialtyId, q]);

  const countText = useMemo(() => {
    if (loading) return "Đang tải…";
    return `${doctors.length} bác sĩ`;
  }, [loading, doctors.length]);

  const activeSpecName = useMemo(() => {
    if (!specialtyId) return "Tất cả";
    const found = specialties.find((s) => String(s.id) === String(specialtyId));
    return found?.name || "Đã chọn";
  }, [specialtyId, specialties]);

  const hasFilter = Boolean(specialtyId) || Boolean(q.trim());

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* HERO */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-3xl overflow-hidden border border-slate-200/60 shadow-[0_20px_70px_-45px_rgba(2,6,23,0.45)]"
        >
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">
                  <Stethoscope className="h-4 w-4" />
                  Danh sách bác sĩ
                </div>

                <h1 className="mt-3 text-2xl md:text-3xl font-black">
                  Chọn bác sĩ phù hợp & đặt lịch nhanh
                </h1>

                <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl">
                  Lọc theo chuyên khoa, tìm theo tên và bấm vào bác sĩ để xem hồ sơ chi tiết.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/85">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                    <Filter className="h-3.5 w-3.5" />
                    Chuyên khoa: <b className="text-white">{activeSpecName}</b>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                    <UserRound className="h-3.5 w-3.5" />
                    Tổng: <b className="text-white">{countText}</b>
                  </span>
                </div>
              </div>

              <div className="hidden md:block text-right">
                <div className="text-sm text-white/80">Tổng</div>
                <div className="text-2xl font-black">{countText}</div>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Specialty */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-white/85 mb-1">
                  Chuyên khoa
                </label>
                <div className="relative">
                  <select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="w-full rounded-2xl bg-white text-slate-900 pl-4 pr-10 py-3 font-semibold outline-none
                               ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {loadingSpec ? (
                      <option disabled>Đang tải chuyên khoa…</option>
                    ) : (
                      specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    ▾
                  </span>
                </div>
              </div>

              {/* Search */}
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-white/85 mb-1">
                  Tìm theo tên
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A…"
                    className="w-full rounded-2xl bg-white text-slate-900 pl-10 pr-10 py-3 font-semibold outline-none
                               ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
                  />
                  {q ? (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Clear search"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Clear */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setSpecialtyId("");
                    setQ("");
                  }}
                  className="w-full rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-3 font-extrabold ring-1 ring-white/25 active:scale-[0.99] transition"
                >
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>

          {/* small footer line */}
          <div className="bg-white px-6 py-3 text-sm text-slate-600 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {hasFilter ? (
                <span>
                  Đang lọc: <b>{activeSpecName}</b>
                  {q.trim() ? (
                    <>
                      {" "}
                      • Từ khóa: <b>{q.trim()}</b>
                    </>
                  ) : null}
                </span>
              ) : (
                <span>Tip: Nhập tên để tìm nhanh, hoặc chọn chuyên khoa để lọc.</span>
              )}
            </div>
            <div className="hidden sm:block font-bold text-slate-500">{countText}</div>
          </div>
        </motion.div>

        {/* BODY */}
        <div className="mt-6">
          {error ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold"
            >
              {error}
            </motion.div>
          ) : null}

          {loading ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          ) : doctors.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
            >
              <div className="font-extrabold text-slate-900">Không có bác sĩ phù hợp</div>
              <div className="text-slate-600 text-sm mt-1">
                Thử đổi chuyên khoa hoặc từ khóa tìm kiếm.
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSpecialtyId("");
                    setQ("");
                  }}
                  className="rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white hover:bg-sky-700 active:scale-[0.99] transition"
                >
                  Reset bộ lọc
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {doctors.map((d, idx) => (
                  <motion.div
                    key={d.doctorId}
                    variants={fadeUp}
                    custom={idx}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="rounded-3xl bg-white border border-slate-200/70 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] hover:shadow-[0_20px_60px_-35px_rgba(2,6,23,0.35)] transition overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={d.avatarUrl || fallbackAvatar}
                          onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                          alt={d.fullName}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-black text-slate-900 truncate">
                              {d.fullName}
                            </div>

                            {d.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Verified
                              </span>
                            ) : null}
                          </div>

                          <div className="text-sm text-slate-600 font-semibold mt-0.5">
                            {d.degree || "Bác sĩ"}
                            {d.positionTitle ? ` • ${d.positionTitle}` : ""}
                          </div>

                          {/* specialties chips */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(d.specialties || []).slice(0, 3).map((s) => (
                              <span
                                key={s.id}
                                className="text-[11px] px-2 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100"
                              >
                                {s.name}
                              </span>
                            ))}
                            {(d.specialties || []).length > 3 ? (
                              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-700 font-bold border border-slate-200">
                                +{(d.specialties || []).length - 3}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-slate-500 font-bold">Phí khám</div>
                          <div className="font-black text-slate-900">
                            {moneyVND(d.consultationFee)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/doctors/${d.doctorId}`)}
                          className="rounded-2xl px-4 py-2 font-extrabold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] transition inline-flex items-center gap-2"
                        >
                          Xem hồ sơ
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <Link
                        to={`/book`}
                        className="block text-center rounded-2xl px-4 py-2.5 font-extrabold bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.99] transition"
                      >
                        Đặt lịch
                      </Link>
                      <div className="mt-2 text-xs text-slate-500 text-center">
                        (Nhấn xem hồ sơ để xem lịch)
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
