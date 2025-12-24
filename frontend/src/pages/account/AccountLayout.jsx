import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";

import Header from "../../components/Header";

const items = [
  { label: "Lịch khám", to: "/account/appointments", icon: CalendarDays },
  { label: "Lịch sử thanh toán", to: "/account/payments", icon: CreditCard },
  { label: "Hồ sơ", to: "/account/profile", icon: FileText },
  { label: "Tài khoản", to: "/account/settings", icon: Settings },
];

const pageV = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.18 } },
  exit: { opacity: 0, y: 10, filter: "blur(2px)", transition: { duration: 0.12 } },
};

export default function AccountLayout() {
  const location = useLocation();

  // Lấy title theo route hiện tại để hiển thị header bên phải
  const activeTitle =
    items.find((x) => location.pathname.startsWith(x.to))?.label || "Tài khoản";

  return (
    <>
      <Header />

      <main className="bg-slate-50 min-h-[calc(100vh-110px)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Page shell */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="rounded-3xl border border-slate-200/70 bg-white shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden md:sticky md:top-24">
                {/* Sidebar header */}
                <div className="p-4 border-b border-slate-200/70 bg-gradient-to-b from-sky-50 to-white">
                  <div className="text-sm font-extrabold text-slate-900">
                    Trung tâm tài khoản
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Quản lý lịch khám, hồ sơ & thanh toán
                  </div>
                </div>

                {/* Sidebar nav */}
                <nav className="p-2">
                  {items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <NavLink
                        key={it.to}
                        to={it.to}
                        className={({ isActive }) =>
                          [
                            "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                            "focus:outline-none focus:ring-2 focus:ring-sky-200",
                            isActive
                              ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                              : "text-slate-700 hover:bg-slate-50",
                          ].join(" ")
                        }
                        end
                      >
                        <span
                          className={[
                            "inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition",
                            "bg-white",
                            location.pathname.startsWith(it.to)
                              ? "border-sky-200 text-sky-700"
                              : "border-slate-200 text-slate-500 group-hover:text-slate-700",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="flex-1">{it.label}</span>

                        <ChevronRight className="h-4 w-4 opacity-0 translate-x-[-2px] transition group-hover:opacity-100 group-hover:translate-x-0" />
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Sidebar footer tip */}
                <div className="px-4 pb-4">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    Tip: Bạn có thể xem nhanh lịch sử đặt lịch và thanh toán ở menu bên trái.
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <section className="col-span-12 md:col-span-8 lg:col-span-9">
              {/* Content header */}
              <div className="mb-4 rounded-3xl border border-slate-200/70 bg-white shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden">
                <div className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50">
                  <div className="text-xs font-bold text-slate-500">TÀI KHOẢN</div>
                  <div className="mt-1 text-xl font-extrabold text-slate-900">
                    {activeTitle}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Thông tin hiển thị theo mục bạn chọn.
                  </div>
                </div>
              </div>

              {/* Outlet card with transition */}
              <div className="rounded-3xl border border-slate-200/70 bg-white shadow-[0_12px_40px_-28px_rgba(2,6,23,0.25)] overflow-hidden">
                <div className="p-4 md:p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      variants={pageV}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      <Outlet />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
