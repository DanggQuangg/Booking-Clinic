import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  Phone,
  Clock,
  Calendar,
  PlusSquare,
  User as UserIcon,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

// ✅ Hướng dẫn giờ chỉ còn là 1 nút => chuyển trang /guide
// (Không còn GUIDE_ITEMS dropdown nữa)

const NAV = [
  { label: "Danh sách bác sĩ", to: "/doctors" },
  { label: "Bảng giá", to: "/pricing" },
  { label: "Liên hệ", to: "/contact" },
];

const pop = {
  hidden: { opacity: 0, y: 10, scale: 0.98, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.16, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    filter: "blur(2px)",
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const slideDown = {
  hidden: { height: 0, opacity: 0 },
  show: { height: "auto", opacity: 1, transition: { duration: 0.18 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.14 } },
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ remove guide dropdown state/ref
  // const [guideOpen, setGuideOpen] = useState(false);
  // const guideRef = useRef(null);

  // dropdown medical services
  const [medicalOpen, setMedicalOpen] = useState(false);
  const medicalRef = useRef(null);

  // modal auth
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // dropdown user
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  // close dropdowns on outside click + ESC
  useEffect(() => {
    const onMouseDown = (e) => {
      // ✅ remove guide outside click
      // if (guideRef.current && !guideRef.current.contains(e.target)) setGuideOpen(false);
      if (medicalRef.current && !medicalRef.current.contains(e.target)) setMedicalOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        // ✅ remove guide
        // setGuideOpen(false);
        setMedicalOpen(false);
        setUserOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // auto-close dropdowns when route changes
  useEffect(() => {
    // ✅ remove guide
    // setGuideOpen(false);
    setMedicalOpen(false);
    setUserOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const doLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const isMedicalActive = useMemo(() => {
    const p = location.pathname || "/";
    return p === "/book" || p.startsWith("/book/") || p === "/services" || p.startsWith("/services/");
  }, [location.pathname]);

  // ✅ optional: active state cho /guide
  const isGuideActive = useMemo(() => {
    const p = location.pathname || "/";
    return p === "/guide" || p.startsWith("/guide/");
  }, [location.pathname]);

  // ===== Theme classes (đồng bộ) =====
  const linkBase =
    "px-3 py-2 rounded-xl font-semibold text-[15px] text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition";
  const linkActive = "text-sky-700 bg-sky-50 ring-1 ring-sky-100";

  const chip =
    "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition";

  const dropdownPanel =
    "rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_60px_-30px_rgba(2,6,23,0.35)] overflow-hidden";

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-200/70">
      {/* TOP BAR */}
      <div className="border-b border-slate-200/60 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
          {/* left */}
          <div className="flex items-center gap-4 min-w-0">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 grid place-items-center text-white font-black shadow-sm">
                +
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-slate-900 text-lg group-hover:text-sky-700 transition">
                  ClinicBooking
                </div>
                <div className="text-[11px] text-slate-500 -mt-1">Đặt khám nhanh</div>
              </div>
            </NavLink>

            <div className="hidden md:flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Tư vấn:</span>
                <span className="font-extrabold text-amber-600">Nhóm 11</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>7:00 - 21:00</span>
              </span>
            </div>
          </div>

          {/* right */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <button type="button" onClick={openLogin} className={`hidden md:inline-flex ${chip}`}>
                  <UserIcon className="h-4 w-4" />
                  Đăng nhập
                </button>

                <button type="button" onClick={openRegister} className={`hidden md:inline-flex ${chip}`}>
                  <UserIcon className="h-4 w-4" />
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="relative hidden md:block" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  className={`${chip} shadow-sm`}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-[180px] truncate">{user.fullName || "Tài khoản"}</span>
                  <ChevronDown className={`h-4 w-4 transition ${userOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      variants={pop}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className={`absolute right-0 top-full mt-2 w-80 ${dropdownPanel}`}
                    >
                      <div className="px-4 py-3 border-b border-slate-200/70 bg-gradient-to-b from-sky-50 to-white">
                        <div className="text-sm font-extrabold text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-600">{user.phone}</div>
                        {user.email ? <div className="text-xs text-slate-600">{user.email}</div> : null}
                      </div>

                      <div className="p-2">
                        <NavLink
                          to="/account/appointments"
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Lịch khám
                        </NavLink>
                        <NavLink
                          to="/account/payments"
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Lịch sử thanh toán
                        </NavLink>
                        <NavLink
                          to="/account/profile"
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Hồ sơ
                        </NavLink>
                        <NavLink
                          to="/account/settings"
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Tài khoản
                        </NavLink>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="p-2">
                        <button
                          className="w-full text-left rounded-xl px-3 py-2 text-sm font-extrabold text-red-600 hover:bg-red-50"
                          onClick={doLogout}
                          type="button"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="hidden md:flex items-center gap-2 h-14">
            {/* ✅ Hướng dẫn: chỉ còn nút link (không dropdown) */}
            <button
              type="button"
              onClick={() => navigate("/guide")}
              className={`${linkBase} ${isGuideActive ? linkActive : ""}`}
            >
              Hướng dẫn
            </button>

            {/* medical dropdown */}
            <div className="relative" ref={medicalRef}>
              <button
                onClick={() => setMedicalOpen((v) => !v)}
                className={`${linkBase} inline-flex items-center gap-1 ${
                  isMedicalActive || medicalOpen ? linkActive : ""
                }`}
                type="button"
                aria-haspopup="menu"
                aria-expanded={medicalOpen}
              >
                Dịch vụ y tế
                <ChevronDown className={`h-4 w-4 transition ${medicalOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {medicalOpen && (
                  <motion.div
                    variants={pop}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className={`absolute left-0 top-full mt-2 w-80 ${dropdownPanel}`}
                  >
                    <div className="p-2">
                      <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-500">DỊCH VỤ</div>

                      <button
                        type="button"
                        className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-start gap-3"
                        onClick={() => navigate("/book")}
                      >
                        <span className="mt-0.5">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <span>
                          <div className="font-extrabold text-slate-900">Đặt lịch theo chuyên khoa</div>
                          <div className="text-xs text-slate-500 -mt-0.5">
                            Chọn chuyên khoa → chọn bác sĩ → chọn giờ
                          </div>
                        </span>
                      </button>

                      <NavLink
                        to="/services"
                        className={({ isActive }) =>
                          isActive
                            ? "block rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50"
                            : "block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5">
                            <PlusSquare className="h-4 w-4" />
                          </span>
                          <span>
                            <div className="font-extrabold text-slate-900">Các dịch vụ thêm</div>
                            <div className="text-xs text-slate-500 -mt-0.5">
                              Xét nghiệm, đo huyết áp, dịch vụ đi kèm…
                            </div>
                          </span>
                        </div>
                      </NavLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => (isActive ? `${linkBase} ${linkActive}` : linkBase)}
              >
                {it.label}
              </NavLink>
            ))}

            <div className="flex-1" />

            {/* CTA small */}
            <button
              type="button"
              onClick={() => navigate("/book")}
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700 shadow-sm active:scale-[0.98] transition"
            >
              <Calendar className="h-4 w-4" />
              Đặt lịch nhanh
            </button>
          </div>

          {/* MOBILE MENU (animated) */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                variants={slideDown}
                initial="hidden"
                animate="show"
                exit="exit"
                className="md:hidden overflow-hidden"
              >
                <div className="py-3 border-t border-slate-200/70">
                  {!user ? (
                    <div className="flex gap-2 px-2 pb-2">
                      <button
                        className="flex-1 rounded-xl border border-sky-200 bg-white px-3 py-2 font-extrabold text-sky-700 hover:bg-sky-50"
                        onClick={openLogin}
                        type="button"
                      >
                        Đăng nhập
                      </button>
                      <button
                        className="flex-1 rounded-xl border border-sky-200 bg-white px-3 py-2 font-extrabold text-sky-700 hover:bg-sky-50"
                        onClick={openRegister}
                        type="button"
                      >
                        Đăng ký
                      </button>
                    </div>
                  ) : (
                    <div className="px-2 pb-2">
                      <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                        <div className="font-extrabold text-slate-900">{user.fullName}</div>
                        <div className="text-sm text-slate-600">{user.phone}</div>
                        {user.email ? <div className="text-sm text-slate-600">{user.email}</div> : null}

                        <div className="mt-3 grid gap-2">
                          <button
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold hover:bg-slate-50"
                            onClick={() => navigate("/account/appointments")}
                            type="button"
                          >
                            Lịch khám
                          </button>
                          <button
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold hover:bg-slate-50"
                            onClick={() => navigate("/account/payments")}
                            type="button"
                          >
                            Lịch sử thanh toán
                          </button>
                          <button
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold hover:bg-slate-50"
                            onClick={() => navigate("/account/profile")}
                            type="button"
                          >
                            Hồ sơ
                          </button>
                          <button
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left font-semibold hover:bg-slate-50"
                            onClick={() => navigate("/account/settings")}
                            type="button"
                          >
                            Tài khoản
                          </button>

                          <button
                            className="w-full rounded-xl bg-red-50 text-red-700 font-extrabold py-2"
                            onClick={doLogout}
                            type="button"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ Hướng dẫn (mobile): chỉ còn 1 nút */}
                  <button
                    onClick={() => navigate("/guide")}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-extrabold ${
                      isGuideActive ? "bg-sky-50 text-sky-700" : "text-slate-900 hover:bg-slate-50"
                    }`}
                    type="button"
                  >
                    <span>Hướng dẫn</span>
                  </button>

                  {/* medical (mobile) */}
                  <button
                    onClick={() => setMedicalOpen((v) => !v)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-extrabold ${
                      medicalOpen || isMedicalActive
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-900 hover:bg-slate-50"
                    }`}
                    type="button"
                  >
                    <span>Dịch vụ y tế</span>
                    <ChevronDown className={`h-4 w-4 transition ${medicalOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {medicalOpen && (
                      <motion.div
                        variants={pop}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="ml-3 border-l border-slate-200 pl-3"
                      >
                        <button
                          className="block w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => navigate("/book")}
                          type="button"
                        >
                          Đặt lịch theo chuyên khoa
                        </button>

                        <NavLink
                          to="/services"
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Các dịch vụ thêm
                        </NavLink>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {NAV.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        isActive
                          ? "block rounded-xl px-3 py-2 font-extrabold text-sky-700 bg-sky-50"
                          : "block rounded-xl px-3 py-2 font-extrabold text-slate-900 hover:bg-slate-50"
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}

                  <div className="px-2 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/book")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-sky-700 active:scale-[0.99] transition"
                    >
                      <Calendar className="h-4 w-4" />
                      Đặt lịch nhanh
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL */}
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={(m) => setAuthMode(m)}
      />
    </header>
  );
}
