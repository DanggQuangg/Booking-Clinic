import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, XCircle, Stethoscope, Sparkles, ArrowRight, Home } from "lucide-react";

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
      <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse" />
      <div className="mt-4 h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
      <div className="mt-2 h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
      <div className="mt-4 h-10 w-full bg-slate-200 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function BookStep1Specialty() {
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ GIỮ LOGIC GỐC: fetch thẳng URL backend của bạn
        const res = await fetch("http://localhost:8088/api/public/specialties");
        if (!res.ok) throw new Error("Không tải được danh sách chuyên khoa.");
        const data = await res.json();
        setSpecialties(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return specialties;
    return specialties.filter((s) => String(s?.name || "").toLowerCase().includes(key));
  }, [specialties, q]);

  const onPick = (s) => {
    if (!s?.id) return;
    // ✅ GIỮ LOGIC GỐC: sang step2 bằng specialtyId
    navigate(`/book/step2?specialtyId=${s.id}`);
  };

  return (
    <>
      <Header />
      <main className="bg-slate-50">
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
                    <Sparkles className="h-4 w-4" />
                    Đặt lịch khám • Bước 1/4
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-black">
                    Chọn <span className="text-white/95">chuyên khoa</span>
                  </h1>

                  <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl">
                    Bước 1: Chọn chuyên khoa → Bước 2: Chọn ngày & bác sĩ → Bước 3: Chọn giờ → Bước 4: Xác nhận
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-2.5 font-extrabold ring-1 ring-white/25 active:scale-[0.99] transition"
                >
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </button>
              </div>

              {/* Search */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-white/85 mb-1">Tìm chuyên khoa</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>

                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="VD: Nội tổng quát, Tai mũi họng..."
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

                <div className="mt-3 flex items-center gap-2 text-xs text-white/85">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 ring-1 ring-white/15">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Kết quả: <b className="text-white">{loading ? "…" : filtered.length}</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-3 text-sm text-slate-600 flex items-center justify-between gap-3">
              <span>
                <b className="text-slate-900">Bước 1:</b> Chọn chuyên khoa
              </span>
              <span className="hidden sm:inline-flex font-bold text-slate-500">
                {loading ? "Đang tải…" : `${specialties.length} chuyên khoa`}
              </span>
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
                className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold"
              >
                {error}
              </motion.div>
            ) : specialties.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
              >
                Chưa có chuyên khoa trong database. Hãy seed bảng <b>specialties</b>.
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
              >
                <div className="font-extrabold text-slate-900">Không tìm thấy chuyên khoa</div>
                <div className="text-slate-600 text-sm mt-1">Hãy thử từ khóa khác hoặc xóa tìm kiếm.</div>
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="mt-4 rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white hover:bg-sky-700 active:scale-[0.99] transition"
                >
                  Xóa tìm kiếm
                </button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filtered.map((s, idx) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => onPick(s)}
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
                      <motion.div variants={pop} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                        <Stethoscope className="h-5 w-5" />
                      </motion.div>

                      <div className="mt-4 font-extrabold text-slate-900 text-lg">
                        {s.name}
                      </div>

                      <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                        {s.description || "Chưa có mô tả"}
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 text-sky-700 font-extrabold text-sm">
                        Chọn chuyên khoa
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
