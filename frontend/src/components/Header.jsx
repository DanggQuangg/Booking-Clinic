import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const GUIDE_ITEMS = [
  { label: "Cách đặt lịch", to: "/guide/booking" },
  { label: "Chuẩn bị trước khi khám", to: "/guide/before-visit" },
  { label: "Câu hỏi thường gặp", to: "/guide/faq" },
];

const NAV = [
  { label: "Danh sách bác sĩ", to: "/doctors" },
  // "Dịch vụ y tế" sẽ là dropdown riêng (không để trong NAV nữa)
  { label: "Bảng giá", to: "/pricing" },
  { label: "Liên hệ", to: "/contact" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // dropdown guide
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef(null);

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
      if (guideRef.current && !guideRef.current.contains(e.target)) setGuideOpen(false);
      if (medicalRef.current && !medicalRef.current.contains(e.target)) setMedicalOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setGuideOpen(false);
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
    setGuideOpen(false);
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

  const linkBase =
    "px-3 py-2 rounded-xl font-semibold text-[15px] text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition";

  const linkActive = "text-sky-700 bg-sky-50 ring-1 ring-sky-100";

  const chip =
    "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 transition";

  const dropdownPanel = "rounded-2xl border bg-white shadow-xl overflow-hidden";

  return (
    <header className="bg-white border-b">
      {/* TOP BAR */}
      <div className="border-b bg-white">
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
                <PhoneIcon />
                <span>Tư vấn:</span>
                <span className="font-extrabold text-amber-600">Nhóm 11</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-2">
                <ClockIcon />
                <span>7:00 - 21:00</span>
              </span>
            </div>
          </div>

          {/* right */}
          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <button type="button" onClick={openLogin} className={`hidden md:inline-flex ${chip}`}>
                  <UserIcon />
                  Đăng nhập
                </button>

                <button type="button" onClick={openRegister} className={`hidden md:inline-flex ${chip}`}>
                  <UserIcon />
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
                  <UserIcon />
                  <span className="max-w-[180px] truncate">{user.fullName || "Tài khoản"}</span>
                  <ChevronDownIcon className={userOpen ? "rotate-180" : ""} />
                </button>

                {userOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-80 ${dropdownPanel}`}>
                    <div className="px-4 py-3 border-b bg-gradient-to-b from-sky-50 to-white">
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
                  </div>
                )}
              </div>
            )}

            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border p-2 hover:bg-slate-50"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="hidden md:flex items-center gap-2 h-14">
            {/* guide dropdown */}
            <div className="relative" ref={guideRef}>
              <button
                onClick={() => setGuideOpen((v) => !v)}
                className={`${linkBase} inline-flex items-center gap-1 ${guideOpen ? linkActive : ""}`}
                type="button"
                aria-haspopup="menu"
                aria-expanded={guideOpen}
              >
                Hướng dẫn
                <ChevronDownIcon className={guideOpen ? "rotate-180" : ""} />
              </button>

              {guideOpen && (
                <div className={`absolute left-0 top-full mt-2 w-72 ${dropdownPanel}`}>
                  <div className="p-2">
                    <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-500">TÀI LIỆU</div>
                    {GUIDE_ITEMS.map((it) => (
                      <NavLink
                        key={it.to}
                        to={it.to}
                        className={({ isActive }) =>
                          isActive
                            ? "block rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 bg-sky-50"
                            : "block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        }
                      >
                        {it.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* medical dropdown (COMBOBOX) */}
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
                <ChevronDownIcon className={medicalOpen ? "rotate-180" : ""} />
              </button>

              {medicalOpen && (
                <div className={`absolute left-0 top-full mt-2 w-80 ${dropdownPanel}`}>
                  <div className="p-2">
                    <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-500">DỊCH VỤ</div>

                    <button
                      type="button"
                      className="w-full text-left rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-start gap-3"
                      onClick={() => navigate("/book")}
                    >
                      <span className="mt-0.5">
                        <CalendarIcon />
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
                          <PlusBoxIcon />
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
                </div>
              )}
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
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-sky-700 shadow-sm"
            >
              <CalendarIcon />
              Đặt lịch nhanh
            </button>
          </div>

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="md:hidden py-3 border-t">
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
                  <div className="rounded-2xl border bg-white p-3">
                    <div className="font-extrabold text-slate-900">{user.fullName}</div>
                    <div className="text-sm text-slate-600">{user.phone}</div>
                    {user.email ? <div className="text-sm text-slate-600">{user.email}</div> : null}

                    <div className="mt-3 grid gap-2">
                      <button
                        className="w-full rounded-xl border px-3 py-2 text-left font-semibold hover:bg-slate-50"
                        onClick={() => navigate("/account/appointments")}
                        type="button"
                      >
                        Lịch khám
                      </button>
                      <button
                        className="w-full rounded-xl border px-3 py-2 text-left font-semibold hover:bg-slate-50"
                        onClick={() => navigate("/account/payments")}
                        type="button"
                      >
                        Lịch sử thanh toán
                      </button>
                      <button
                        className="w-full rounded-xl border px-3 py-2 text-left font-semibold hover:bg-slate-50"
                        onClick={() => navigate("/account/profile")}
                        type="button"
                      >
                        Hồ sơ
                      </button>
                      <button
                        className="w-full rounded-xl border px-3 py-2 text-left font-semibold hover:bg-slate-50"
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

              {/* guide (mobile) */}
              <button
                onClick={() => setGuideOpen((v) => !v)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-extrabold ${
                  guideOpen ? "bg-sky-50 text-sky-700" : "text-slate-900 hover:bg-slate-50"
                }`}
                type="button"
              >
                <span>Hướng dẫn</span>
                <ChevronDownIcon className={guideOpen ? "rotate-180" : ""} />
              </button>

              {guideOpen && (
                <div className="ml-3 border-l pl-3">
                  {GUIDE_ITEMS.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setGuideOpen(false)}
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* medical (mobile) */}
              <button
                onClick={() => setMedicalOpen((v) => !v)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 font-extrabold ${
                  medicalOpen || isMedicalActive ? "bg-sky-50 text-sky-700" : "text-slate-900 hover:bg-slate-50"
                }`}
                type="button"
              >
                <span>Dịch vụ y tế</span>
                <ChevronDownIcon className={medicalOpen ? "rotate-180" : ""} />
              </button>

              {medicalOpen && (
                <div className="ml-3 border-l pl-3">
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
                </div>
              )}

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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-sky-700"
                >
                  <CalendarIcon />
                  Đặt lịch nhanh
                </button>
              </div>
            </div>
          )}
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

/* Icons */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition ${className}`}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.67-1.14a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 2v3M16 2v3M3 9h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 13h2M12 13h2M16 13h2M8 17h2M12 17h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusBoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
