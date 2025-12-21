export default function AppointmentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-800">Lịch khám</h1>
        <button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          <span>🔎</span> Lọc
        </button>
      </div>

      <div className="mt-4">
        <input
          className="w-full max-w-md rounded-xl border px-4 py-2 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Mã giao dịch, tên dịch vụ, tên bệnh nhân,..."
        />
      </div>

      <div className="mt-8 rounded-2xl border bg-slate-50 p-10 text-center">
        <div className="text-slate-500">Lịch khám của bạn trống!</div>
      </div>
    </div>
  );
}
