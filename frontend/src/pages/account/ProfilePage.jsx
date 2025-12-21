import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800">Hồ sơ</h1>

      <div className="mt-6 grid gap-4 max-w-xl">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-500">Họ tên</div>
          <div className="font-bold text-slate-800">{user?.fullName || "-"}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-500">Số điện thoại</div>
          <div className="font-bold text-slate-800">{user?.phone || "-"}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-500">Email</div>
          <div className="font-bold text-slate-800">{user?.email || "-"}</div>
        </div>
      </div>
    </div>
  );
}
