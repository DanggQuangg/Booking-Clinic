import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookStep2DateDoctor() {
  const q = useQuery();
  const specialtyId = q.get("specialtyId");
  const navigate = useNavigate();

  const today = new Date();
  const minDate = formatDateISO(today);

  // default: ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [date, setDate] = useState(formatDateISO(tomorrow));
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  const loadDoctors = async (spId, dt) => {
    if (!spId || !dt) return;
    try {
      setLoading(true);
      setError("");
      setDoctors([]);

      const res = await fetch(
        `/api/public/doctors/available?specialtyId=${spId}&date=${dt}`
      );
      if (!res.ok) throw new Error("Không tải được danh sách bác sĩ.");
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // load lần đầu + khi đổi specialtyId
  useEffect(() => {
    if (!specialtyId) {
      setError("Thiếu specialtyId. Hãy quay lại bước 1.");
      return;
    }
    loadDoctors(specialtyId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyId]);

  // khi đổi ngày => reload doctors
  useEffect(() => {
    if (!specialtyId || !date) return;
    loadDoctors(specialtyId, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const onPickDoctor = (doctorId) => {
    navigate(`/book/step3?specialtyId=${specialtyId}&date=${date}&doctorId=${doctorId}`);
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Đặt lịch khám</h1>
            <p className="text-slate-600 mt-1">
              Bước 2: Chọn ngày & bác sĩ • Chuyên khoa #{specialtyId || "?"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/book")}
            className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Quay lại bước 1
          </button>
        </div>

        {/* Chọn ngày */}
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <label className="block text-slate-700 font-semibold mb-2">
            Chọn ngày khám
          </label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-sm rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-sky-200"
          />
          <div className="text-slate-500 text-sm mt-2">
            Đổi ngày sẽ tự tải lại bác sĩ khả dụng.
          </div>
        </div>

        {/* Danh sách bác sĩ */}
        <div className="mt-6">
          {loading ? (
            <div className="text-slate-600">Đang tải bác sĩ...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-slate-700">
              Không có bác sĩ khả dụng cho ngày <b>{date}</b>.<br />
              Hãy kiểm tra bảng <b>doctor_weekly_time_slots</b> (ACTIVE) đúng thứ của ngày này.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <button
                  key={d.doctorId}
                  type="button"
                  onClick={() => onPickDoctor(d.doctorId)}
                  className="text-left rounded-2xl border bg-white p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {d.avatarUrl ? (
                        <img
                          src={d.avatarUrl}
                          alt={d.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate">
                        {d.fullName}
                        {d.isVerified ? (
                          <span className="ml-2 text-xs font-bold text-emerald-700">
                            ✔ Verified
                          </span>
                        ) : null}
                      </div>
                      <div className="text-slate-600 text-sm truncate">
                        {d.degree || "—"} • {d.positionTitle || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-slate-700 text-sm">
                    Phí khám:{" "}
                    <span className="font-extrabold">
                      {Number(d.consultationFee || 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="mt-3 text-sky-700 font-bold text-sm">
                    Chọn bác sĩ →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
