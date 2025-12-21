import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const GUIDE_ITEMS = [
  { label: "Cách đặt lịch", to: "/guide/booking" },
  { label: "Chuẩn bị trước khi khám", to: "/guide/before-visit" },
  { label: "Câu hỏi thường gặp", to: "/guide/faq" },
];

const NAV = [
  { label: "Danh sách bác sĩ", to: "/doctors" },
  { label: "Dịch vụ y tế", to: "/services" },
  { label: "Bảng giá", to: "/pricing" },
  { label: "Liên hệ", to: "/contact" },
];

export default function Header() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef(null);

  // modal auth
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // dropdown user
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (guideRef.current && !guideRef.current.contains(e.target)) setGuideOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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

  const linkBase =
    "px-3 py-2 rounded-lg font-semibold text-[15px] text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition";
  const linkActive = "text-sky-700 bg-sky-50";

  return (
    <header className="bg-white border-b">
      {/* TOP BAR */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
          {/* left */}
          <div className="flex items-center gap-4 min-w-0">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-sky-600 grid place-items-center text-white font-black">+</div>
              <div className="leading-tight">
                <div className="font-extrabold text-sky-700 text-lg">ClinicBooking</div>
                <div className="text-[11px] text-slate-500 -mt-1">Đặt khám nhanh</div>
              </div>
            </NavLink>

            <div className="hidden md:flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <PhoneIcon />
                <span>Tư vấn:</span>
                <span className="font-bold text-amber-600">Nhóm 11</span>
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
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                >
                  <UserIcon />
                  Đăng nhập
                </button>

                <button
                  type="button"
                  onClick={openRegister}
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                >
                  <UserIcon />
                  Đăng ký
                </button>
              </>
            ) : (
              <div className="relative hidden md:block" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                >
                  <UserIcon />
                  {user.fullName || "Tài khoản"}
                  <ChevronDownIcon />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-white shadow-lg p-2">
                    <div className="px-3 py-2">
                      <div className="text-sm font-bold text-slate-800">{user.fullName}</div>
                      <div className="text-xs text-slate-500">{user.phone}</div>
                      {user.email ? <div className="text-xs text-slate-500">{user.email}</div> : null}
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setUserOpen(false);
                      }}
                      type="button"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg border p-2"
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
                className={`${linkBase} inline-flex items-center gap-1`}
              >
                Hướng dẫn
                <ChevronDownIcon />
              </button>

              {guideOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border bg-white shadow-lg p-2">
                  {GUIDE_ITEMS.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setGuideOpen(false)}
                    >
                      {it.label}
                    </NavLink>
                  ))}
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
          </div>

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="md:hidden py-3 border-t">
              {!user ? (
                <div className="flex gap-2 px-2 pb-2">
                  <button
                    className="flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 font-semibold text-sky-700"
                    onClick={openLogin}
                    type="button"
                  >
                    Đăng nhập
                  </button>
                  <button
                    className="flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 font-semibold text-sky-700"
                    onClick={openRegister}
                    type="button"
                  >
                    Đăng ký
                  </button>
                </div>
              ) : (
                <div className="px-2 pb-2">
                  <div className="rounded-xl border p-3">
                    <div className="font-bold text-slate-800">{user.fullName}</div>
                    <div className="text-sm text-slate-500">{user.phone}</div>
                    {user.email ? <div className="text-sm text-slate-500">{user.email}</div> : null}
                    <button
                      className="mt-3 w-full rounded-lg bg-red-50 text-red-700 font-semibold py-2"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      type="button"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setGuideOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>Hướng dẫn</span>
                <ChevronDownIcon />
              </button>

              {guideOpen && (
                <div className="ml-3 border-l pl-3">
                  {GUIDE_ITEMS.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setGuideOpen(false);
                        setMobileOpen(false);
                      }}
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {NAV.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className="block rounded-lg px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {it.label}
                </NavLink>
              ))}
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

/* Icons ... (giữ nguyên phần icons của bạn) */
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
function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
