import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../lib/api"; 
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, updateLocalUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });

  const loadMe = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const me = await apiGet("/api/account/me");
      setProfile({
        fullName: me.fullName || "",
        phone: me.phone || "",
        email: me.email || "",
      });

      // Đồng bộ lại localStorage/AuthContext (phòng khi email/fullName thay đổi từ nơi khác)
      updateLocalUser?.({ fullName: me.fullName, phone: me.phone, email: me.email });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không tải được thông tin tài khoản." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Nếu bạn muốn khỏi gọi API khi chưa login:
    if (!user?.token) {
      setLoading(false);
      return;
    }
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMsg({ type: "", text: "" });

    try {
      const updated = await apiPut("/api/account/me", {
        fullName: profile.fullName,
        email: profile.email,
      });

      setProfile((p) => ({
        ...p,
        fullName: updated.fullName || "",
        phone: updated.phone || "",
        email: updated.email || "",
      }));

      updateLocalUser?.({
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email,
      });

      setMsg({ type: "success", text: "Đã cập nhật thông tin tài khoản." });
    } catch (e2) {
      setMsg({ type: "error", text: e2.message || "Cập nhật thất bại." });
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    setMsg({ type: "", text: "" });

    if (pwd.newPassword !== pwd.confirmNewPassword) {
      setMsg({ type: "error", text: "Xác nhận mật khẩu mới không khớp." });
      setSavingPwd(false);
      return;
    }

    try {
      await apiPut("/api/account/me/password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });

      setPwd({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setMsg({ type: "success", text: "Đổi mật khẩu thành công." });
    } catch (e2) {
      setMsg({ type: "error", text: e2.message || "Đổi mật khẩu thất bại." });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800">Tài khoản</h1>

      {msg.text && (
        <div
          className={[
            "mt-4 rounded-xl border px-4 py-3 text-sm",
            msg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-slate-500">Đang tải...</div>
      ) : !user?.token ? (
        <div className="mt-6 text-slate-500">Bạn cần đăng nhập để xem trang này.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Thông tin */}
          <form onSubmit={onSaveProfile} className="rounded-2xl border bg-white p-5">
            <div className="text-base font-extrabold text-slate-800">Thông tin cá nhân</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm bg-slate-50 text-slate-600"
                  value={profile.phone}
                  readOnly
                />
                <div className="mt-1 text-xs text-slate-500">Không thể thay đổi số điện thoại.</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Họ tên</label>
                <input
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="example@gmail.com"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

          {/* Đổi mật khẩu */}
          <form onSubmit={onChangePassword} className="rounded-2xl border bg-white p-5">
            <div className="text-base font-extrabold text-slate-800">Đổi mật khẩu</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  value={pwd.currentPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  value={pwd.newPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  value={pwd.confirmNewPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingPwd}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-60"
              >
                {savingPwd ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
