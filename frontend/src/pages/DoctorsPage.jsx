import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function DoctorsPage() {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSpec, setLoadingSpec] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  // Load specialties
  useEffect(() => {
    let mounted = true;
    setLoadingSpec(true);
    apiGet("/api/public/specialties")
      .then((data) => {
        if (!mounted) return;
        setSpecialties(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setSpecialties([]);
      })
      .finally(() => mounted && setLoadingSpec(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Load doctors (server-side filter)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (specialtyId) params.set("specialtyId", specialtyId);
    if (q.trim()) params.set("q", q.trim());

    apiGet(`/api/public/doctors?${params.toString()}`)
      .then((data) => {
        if (!mounted) return;
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Không tải được danh sách bác sĩ");
        setDoctors([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [specialtyId, q]);

  const countText = useMemo(() => {
    if (loading) return "Đang tải…";
    return `${doctors.length} bác sĩ`;
  }, [loading, doctors.length]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Danh sách bác sĩ</h1>
              <p className="mt-2 text-white/85 text-sm md:text-base">
                Lọc theo chuyên khoa, tìm theo tên và bấm vào bác sĩ để xem hồ sơ chi tiết.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-white/80">Tổng</div>
              <div className="text-2xl font-black">{countText}</div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-white/85 mb-1">Chuyên khoa</label>
              <div className="relative">
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className="w-full rounded-2xl bg-white text-slate-900 px-4 py-3 pr-10 font-semibold outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {loadingSpec ? (
                    <option disabled>Đang tải chuyên khoa…</option>
                  ) : (
                    specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
              </div>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-white/85 mb-1">Tìm theo tên</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A…"
                className="w-full rounded-2xl bg-white text-slate-900 px-4 py-3 font-semibold outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSpecialtyId("");
                  setQ("");
                }}
                className="w-full rounded-2xl bg-white/15 hover:bg-white/20 text-white px-4 py-3 font-extrabold ring-1 ring-white/25"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="mt-6">
          {error ? (
            <div className="rounded-2xl border bg-white p-4 text-red-600 font-semibold">{error}</div>
          ) : null}

          {loading ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-white border p-4 animate-pulse">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                  <div className="mt-4 h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded" />
                  <div className="mt-4 h-9 w-full bg-slate-200 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-6">
              <div className="font-extrabold text-slate-900">Không có bác sĩ phù hợp</div>
              <div className="text-slate-600 text-sm mt-1">Thử đổi chuyên khoa hoặc từ khóa tìm kiếm.</div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <div
                  key={d.doctorId}
                  className="rounded-3xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={d.avatarUrl || fallbackAvatar}
                        onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                        alt={d.fullName}
                        className="h-14 w-14 rounded-2xl object-cover border"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-black text-slate-900 truncate">{d.fullName}</div>
                          {d.isVerified ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100">
                              Verified
                            </span>
                          ) : null}
                        </div>

                        <div className="text-sm text-slate-600 font-semibold mt-0.5">
                          {d.degree || "Bác sĩ"} {d.positionTitle ? `• ${d.positionTitle}` : ""}
                        </div>

                        {/* specialties chips */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(d.specialties || []).slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="text-[11px] px-2 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100"
                            >
                              {s.name}
                            </span>
                          ))}
                          {(d.specialties || []).length > 3 ? (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-700 font-bold border">
                              +{(d.specialties || []).length - 3}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500 font-bold">Phí khám</div>
                        <div className="font-black text-slate-900">{moneyVND(d.consultationFee)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/doctors/${d.doctorId}`)}
                          className="rounded-2xl px-4 py-2 font-extrabold bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Xem hồ sơ
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <Link
                      to={`/book`}
                      className="block text-center rounded-2xl px-4 py-2 font-extrabold bg-sky-600 text-white hover:bg-sky-700"
                    >
                      Đặt lịch
                    </Link>
                    <div className="mt-2 text-xs text-slate-500 text-center">
                      (Bạn có thể dẫn tới step2 theo bác sĩ sau này)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
