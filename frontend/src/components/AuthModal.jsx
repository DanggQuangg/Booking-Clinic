import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, Lock, Mail, User2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const overlayV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

const modalV = {
  hidden: { opacity: 0, y: 30, scale: 0.98, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 300, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: "blur(2px)",
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

export default function AuthModal({ open, mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isLogin = mode === "login";
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [regForm, setRegForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!open) return;
    setErr("");
  }, [open, mode]);

  // ✅ ESC để đóng nhanh
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const title = useMemo(() => (isLogin ? "Đăng nhập" : "Đăng ký"), [isLogin]);
  const subtitle = useMemo(
    () =>
      isLogin
        ? "Nhập SĐT và mật khẩu để tiếp tục"
        : "Tạo tài khoản mới để đặt lịch nhanh hơn",
    [isLogin]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isLogin) {
        const userData = await login(loginForm);

        // điều hướng theo role
        if (userData?.role === "DOCTOR")
          navigate("/doctor/dashboard", { replace: true });
        else navigate("/", { replace: true });

        onClose?.();
      } else {
        await register(regForm);
        alert("Đăng ký thành công! Hãy đăng nhập.");
        onSwitchMode?.("login");
      }
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex?.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <motion.div
            variants={overlayV}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 bg-black/45"
            onMouseDown={onClose}
            aria-hidden="true"
          />

          {/* dialog wrapper (CENTER) */}
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              variants={modalV}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-md max-h-[calc(100vh-3rem)]"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_70px_-35px_rgba(2,6,23,0.45)] overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-slate-200/70 bg-gradient-to-b from-sky-50 to-white">
                  <div className="pr-10">
                    <div className="text-xl font-extrabold text-slate-900">
                      {title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {subtitle}
                    </div>
                  </div>

                  <button
                    className="absolute right-4 top-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 active:scale-[0.98] transition"
                    onClick={onClose}
                    type="button"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body (SCROLL) */}
                <form
                  className="px-6 py-5 space-y-3 overflow-y-auto"
                  onSubmit={onSubmit}
                >
                  {isLogin ? (
                    <>
                      <Field
                        label="Số điện thoại"
                        icon={<Phone className="h-4 w-4" />}
                        value={loginForm.phone}
                        onChange={(v) =>
                          setLoginForm((s) => ({ ...s, phone: v }))
                        }
                        placeholder="VD: 090xxxxxxx"
                        autoComplete="tel"
                        disabled={loading}
                      />
                      <Field
                        label="Mật khẩu"
                        icon={<Lock className="h-4 w-4" />}
                        type="password"
                        value={loginForm.password}
                        onChange={(v) =>
                          setLoginForm((s) => ({ ...s, password: v }))
                        }
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={loading}
                      />
                    </>
                  ) : (
                    <>
                      <Field
                        label="Họ và tên"
                        icon={<User2 className="h-4 w-4" />}
                        value={regForm.fullName}
                        onChange={(v) =>
                          setRegForm((s) => ({ ...s, fullName: v }))
                        }
                        placeholder="VD: Nguyễn Văn A"
                        autoComplete="name"
                        disabled={loading}
                      />
                      <Field
                        label="Số điện thoại"
                        icon={<Phone className="h-4 w-4" />}
                        value={regForm.phone}
                        onChange={(v) =>
                          setRegForm((s) => ({ ...s, phone: v }))
                        }
                        placeholder="VD: 090xxxxxxx"
                        autoComplete="tel"
                        disabled={loading}
                      />
                      <Field
                        label="Email"
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        value={regForm.email}
                        onChange={(v) =>
                          setRegForm((s) => ({ ...s, email: v }))
                        }
                        placeholder="VD: a@gmail.com"
                        autoComplete="email"
                        disabled={loading}
                      />
                      <Field
                        label="Mật khẩu"
                        icon={<Lock className="h-4 w-4" />}
                        type="password"
                        value={regForm.password}
                        onChange={(v) =>
                          setRegForm((s) => ({ ...s, password: v }))
                        }
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </>
                  )}

                  {err && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {err}
                    </motion.div>
                  )}

                  <button
                    className="w-full rounded-2xl bg-sky-600 text-white font-extrabold py-3 hover:bg-sky-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : isLogin ? (
                      "Đăng nhập"
                    ) : (
                      "Đăng ký"
                    )}
                  </button>

                  <div className="text-sm text-slate-600 text-center">
                    {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                    <button
                      type="button"
                      className="font-extrabold text-sky-700 hover:underline"
                      onClick={() =>
                        onSwitchMode?.(isLogin ? "register" : "login")
                      }
                      disabled={loading}
                    >
                      {isLogin ? "Đăng ký" : "Đăng nhập"}
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 text-center pt-1">
                    Tip: bạn có thể bấm <span className="font-bold">ESC</span>{" "}
                    để đóng nhanh.
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  autoComplete,
  disabled,
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-1">{label}</div>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white pr-3 py-2.5 outline-none
                     focus:ring-2 focus:ring-sky-200 focus:border-sky-200
                     hover:border-slate-300 transition disabled:bg-slate-50 disabled:cursor-not-allowed
                     ${icon ? "pl-10" : "pl-3"}`}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      </div>
    </label>
  );
}
