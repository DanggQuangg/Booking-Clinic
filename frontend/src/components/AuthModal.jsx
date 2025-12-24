import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const title = useMemo(() => (isLogin ? "Đăng nhập" : "Đăng ký"), [isLogin]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isLogin) {
        const userData = await login(loginForm);

        // điều hướng theo role
        if (userData?.role === "DOCTOR") navigate("/doctor/dashboard", { replace: true });
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onMouseDown={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-xl border"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <button onClick={onClose} className="border px-3 py-1 rounded-lg">
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
                />
                <Field
                  label="Mật khẩu"
                  type="password"
                  value={loginForm.password}
                  onChange={(v) => setLoginForm((s) => ({ ...s, password: v }))}
                />
              </>
            ) : (
              <p>Phần đăng ký...</p>
            )}

            {err && <div className="text-red-600 text-sm">{err}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-2 rounded-xl"
            >
              {loading ? "Đang xử lý..." : title}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{label}</div>
      <input
        className="w-full border rounded-xl px-3 py-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
