import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open, mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const isLogin = mode === "login";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [regForm, setRegForm] = useState({ fullName: "", phone: "", email: "", password: "" });

  useEffect(() => {
    if (!open) return;
    setErr("");
  }, [open, mode]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const title = useMemo(() => (isLogin ? "Đăng nhập" : "Đăng ký"), [isLogin]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(loginForm);
      } else {
        await register(regForm);
      }
      onClose?.(); // thành công -> đóng modal
    } catch (ex) {
      setErr(ex?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-xl border"
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold text-slate-800">{title}</div>
              <div className="text-sm text-slate-500">
                {isLogin ? "Nhập SĐT và mật khẩu để tiếp tục" : "Tạo tài khoản mới"}
              </div>
            </div>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Đóng
            </button>
          </div>

          <form className="p-5 space-y-3" onSubmit={onSubmit}>
            {isLogin ? (
              <>
                <Field
                  label="Số điện thoại"
                  value={loginForm.phone}
                  onChange={(v) => setLoginForm((s) => ({ ...s, phone: v }))}
                  placeholder="VD: 090xxxxxxx"
                />
                <Field
                  label="Mật khẩu"
                  type="password"
                  value={loginForm.password}
                  onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))}
                  placeholder="••••••••"
                />
              </>
            ) : (
              <>
                <Field
                  label="Họ và tên"
                  value={regForm.fullName}
                  onChange={(v) => setRegForm((s) => ({ ...s, fullName: v }))}
                  placeholder="VD: Nguyễn Văn A"
                />
                <Field
                  label="Số điện thoại"
                  value={regForm.phone}
                  onChange={(v) => setRegForm((s) => ({ ...s, phone: v }))}
                  placeholder="VD: 090xxxxxxx"
                />
                <Field
                  label="Email"
                  type="email"
                  value={regForm.email}
                  onChange={(v) => setRegForm((s) => ({ ...s, email: v }))}
                  placeholder="VD: a@gmail.com"
                />
                <Field
                  label="Mật khẩu"
                  type="password"
                  value={regForm.password}
                  onChange={(v) => setRegForm((s) => ({ ...s, password: v }))}
                  placeholder="••••••••"
                />
              </>
            )}

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-sky-600 text-white font-bold py-2.5 hover:bg-sky-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>

            <div className="text-sm text-slate-600 text-center">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                type="button"
                className="font-bold text-sky-700 hover:underline"
                onClick={() => onSwitchMode?.(isLogin ? "register" : "login")}
              >
                {isLogin ? "Đăng ký" : "Đăng nhập"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-1">{label}</div>
      <input
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
