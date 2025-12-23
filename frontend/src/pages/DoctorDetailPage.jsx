import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { apiGet } from "../lib/api";

const fallbackAvatar =
  "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=600&auto=format&fit=crop&q=60";

function moneyVND(n) {
  if (n == null) return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " đ";
}

const DOW = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "Chủ nhật",
};

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    apiGet(`/api/public/doctors/${id}`)
      .then((data) => mounted && setDoctor(data))
      .catch((e) => mounted && setError(e?.message || "Không tải được hồ sơ bác sĩ"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const groupedSlots = useMemo(() => {
    const map = new Map();
    const slots = doctor?.weeklySlots || [];
    for (const s of slots) {
      const key = s.dayOfWeek;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    // sort each day by start_time
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
      map.set(k, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [doctor]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl border bg-white px-4 py-2 font-extrabold text-slate-800 hover:bg-slate-50"
            type="button"
          >
            ← Quay lại
          </button>
          <Link
            to="/doctors"
            className="rounded-2xl border bg-white px-4 py-2 font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Danh sách bác sĩ
          </Link>
        </div>

        {loading ? (
          <div className="mt-4 rounded-3xl border bg-white p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-3xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-5 w-1/2 bg-slate-200 rounded" />
                <div className="mt-2 h-4 w-1/3 bg-slate-200 rounded" />
                <div className="mt-3 h-10 w-40 bg-slate-200 rounded-2xl" />
              </div>
            </div>
            <div className="mt-6 h-4 w-2/3 bg-slate-200 rounded" />
            <div className="mt-2 h-4 w-3/4 bg-slate-200 rounded" />
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl border bg-white p-4 text-red-600 font-semibold">{error}</div>
        ) : !doctor ? (
          <div className="mt-4 rounded-2xl border bg-white p-4 font-semibold">Không tìm thấy bác sĩ.</div>
        ) : (
          <>
            {/* TOP CARD */}
            <div className="mt-4 rounded-3xl border bg-white shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 bg-gradient-to-br from-white to-sky-50">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <img
                    src={doctor.avatarUrl || fallbackAvatar}
                    onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                    alt={doctor.fullName}
                    className="h-24 w-24 rounded-3xl object-cover border"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900">{doctor.fullName}</h1>
                      {doctor.isVerified ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100">
                          Verified
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-slate-700 font-semibold">
                      {doctor.degree || "Bác sĩ"} {doctor.positionTitle ? `• ${doctor.positionTitle}` : ""}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(doctor.specialties || []).map((s) => (
                        <span
                          key={s.id}
                          className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="rounded-2xl bg-white border px-4 py-3">
                        <div className="text-xs text-slate-500 font-bold">Phí khám</div>
                        <div className="text-lg font-black text-slate-900">{moneyVND(doctor.consultationFee)}</div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to="/book"
                          className="rounded-2xl px-5 py-3 font-extrabold bg-sky-600 text-white hover:bg-sky-700"
                        >
                          Đặt lịch khám
                        </Link>
                        <Link
                          to="/contact"
                          className="rounded-2xl px-5 py-3 font-extrabold bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Liên hệ
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quick info */}
                  <div className="md:w-64 rounded-3xl border bg-white p-4">
                    <div className="text-xs font-black text-slate-500">THÔNG TIN</div>
                    <div className="mt-2 grid gap-2 text-sm">
                      <InfoRow label="Email" value={doctor.email || "—"} />
                      <InfoRow label="Giới tính" value={doctor.gender || "—"} />
                      <InfoRow label="Ngày sinh" value={doctor.dob || "—"} />
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      (* Có thể ẩn/sửa tuỳ chính sách hiển thị)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIO */}
            <div className="mt-4 rounded-3xl border bg-white p-6">
              <div className="text-lg font-black text-slate-900">Giới thiệu</div>
              <div className="mt-2 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {doctor.bio || "Chưa có thông tin giới thiệu."}
              </div>
            </div>

            {/* WEEKLY SLOTS */}
            <div className="mt-4 rounded-3xl border bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-slate-900">Lịch khám theo tuần</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Đây là lịch cố định (weekly). Khi đặt lịch, bạn sẽ chọn ngày + slot tương ứng.
                  </div>
                </div>
              </div>

              {groupedSlots.length === 0 ? (
                <div className="mt-4 rounded-2xl border bg-slate-50 p-4 font-semibold text-slate-700">
                  Chưa có lịch khám được cấu hình.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedSlots.map(([day, arr]) => (
                    <div key={day} className="rounded-3xl border bg-slate-50 p-4">
                      <div className="font-black text-slate-900">{DOW[day] || `Day ${day}`}</div>
                      <div className="mt-3 grid gap-2">
                        {arr.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-2xl bg-white border px-3 py-2 flex items-center justify-between"
                          >
                            <div className="font-extrabold text-slate-900">
                              {String(s.startTime).slice(0, 5)} - {String(s.endTime).slice(0, 5)}
                            </div>
                            <div className="text-xs text-slate-600 font-bold">
                              {s.roomName ? `Phòng ${s.roomName}` : "—"} • {s.capacity ?? "—"} suất
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-slate-500 font-bold">{label}</div>
      <div className="text-slate-900 font-extrabold text-right break-all">{value}</div>
    </div>
  );
}
