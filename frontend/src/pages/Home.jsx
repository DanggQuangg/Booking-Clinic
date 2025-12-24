import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Stethoscope,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  Building2,
} from "lucide-react";

import Header from "../components/Header";

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(2px)" },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22, delay: i * 0.06, ease: "easeOut" },
  }),
};

const pop = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
};

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      variants={pop}
      className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] hover:shadow-[0_20px_60px_-35px_rgba(2,6,23,0.35)] transition"
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
        {icon}
      </div>
      <div className="mt-4 text-lg font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const features = useMemo(
    () => [
      {
        icon: <CalendarDays className="h-5 w-5" />,
        title: "Đặt lịch nhanh theo chuyên khoa",
        desc: "Chọn chuyên khoa → chọn bác sĩ → chọn giờ. Tối ưu thao tác và giảm thời gian chờ.",
      },
      {
        icon: <Stethoscope className="h-5 w-5" />,
        title: "Danh sách bác sĩ rõ ràng",
        desc: "Xem thông tin, chuyên môn, kinh nghiệm và khung giờ trống để đặt lịch phù hợp.",
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        title: "Thông tin minh bạch",
        desc: "Bảng giá, dịch vụ, quy trình khám được hiển thị rõ để bạn yên tâm trước khi đi khám.",
      },
      {
        icon: <Clock className="h-5 w-5" />,
        title: "Chủ động thời gian",
        desc: "Đặt lịch linh hoạt theo ngày/giờ phù hợp. Tránh xếp hàng và giảm quá tải quầy tiếp nhận.",
      },
    ],
    []
  );

  return (
    <>
      <Header />

      <main className="bg-slate-50">
        {/* HERO */}
        <section className="relative overflow-hidden">
          {/* soft background */}
          <div className="absolute inset-0">
            <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl" />
            <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-slate-50" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-14 md:pb-12">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left */}
              <div className="col-span-12 lg:col-span-7">
                <motion.div
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-extrabold text-sky-700 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  ClinicBooking — Đặt khám nhanh, dễ dùng
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-5 text-3xl md:text-5xl font-black text-slate-900 leading-tight"
                >
                  Đặt lịch khám{" "}
                  <span className="bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
                    nhanh chóng
                  </span>{" "}
                  và chủ động thời gian
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed"
                >
                  Tìm bác sĩ theo chuyên khoa, xem lịch trống và đặt lịch trong vài bước.
                  Giảm thời gian chờ — tăng trải nghiệm khám chữa bệnh.
                </motion.p>

                {/* CTA */}
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-6 flex flex-col sm:flex-row gap-3"
                >
                  <button
                    type="button"
                    onClick={() => navigate("/book")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white shadow-sm hover:bg-sky-700 active:scale-[0.99] transition"
                  >
                    <CalendarDays className="h-5 w-5" />
                    Đặt lịch ngay
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/doctors")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition"
                  >
                    <Search className="h-5 w-5 text-slate-500" />
                    Xem bác sĩ
                  </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <Stat label="Đặt lịch" value="Nhanh & gọn" />
                  <Stat label="Thời gian" value="Chủ động" />
                  <Stat label="Thông tin" value="Minh bạch" />
                  <Stat label="Trải nghiệm" value="Mượt mà" />
                </motion.div>
              </div>

              {/* Right - mock card */}
              <div className="col-span-12 lg:col-span-5">
                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="rounded-[28px] border border-slate-200/70 bg-white shadow-[0_25px_70px_-35px_rgba(2,6,23,0.45)] overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-200/70 bg-gradient-to-b from-sky-50 to-white">
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-sky-700" />
                      Gợi ý đặt lịch nhanh
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Một quy trình đơn giản cho bệnh nhân.
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-bold text-slate-500">Bước 1</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Chọn chuyên khoa
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-bold text-slate-500">Bước 2</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Chọn bác sĩ phù hợp
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-bold text-slate-500">Bước 3</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Chọn ngày & khung giờ
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/book")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-extrabold text-white hover:bg-slate-800 active:scale-[0.99] transition"
                    >
                      Bắt đầu đặt lịch
                      <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="text-xs text-slate-500 text-center">
                      *Giao diện demo, dữ liệu thực tế hiển thị ở trang đặt lịch.
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="flex items-end justify-between gap-3"
          >
            <div>
              <div className="text-xs font-bold text-slate-500">TÍNH NĂNG</div>
              <h2 className="mt-1 text-2xl md:text-3xl font-black text-slate-900">
                Trải nghiệm đặt khám mượt mà
              </h2>
              <p className="mt-2 text-slate-600">
                Giao diện rõ ràng, thao tác ít, thông tin dễ hiểu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/pricing")}
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50 transition"
            >
              Xem bảng giá <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {features.map((f, idx) => (
                <motion.div
                  key={f.title}
                  custom={idx}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                >
                  <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom CTA */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-8 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)]"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  Sẵn sàng đặt lịch khám?
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Chỉ vài bước để chọn bác sĩ và khung giờ phù hợp.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/book")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white hover:bg-sky-700 active:scale-[0.99] transition"
                >
                  <CalendarDays className="h-5 w-5" />
                  Đặt lịch ngay
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-800 hover:bg-slate-50 active:scale-[0.99] transition"
                >
                  Xem dịch vụ
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
