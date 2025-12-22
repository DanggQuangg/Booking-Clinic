import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function BookStep3Slot() {
  const q = useQuery();
  const specialtyId = q.get("specialtyId");
  const date = q.get("date");
  const doctorId = q.get("doctorId");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  useEffect(() => {
    if (!specialtyId || !date || !doctorId) {
      setLoading(false);
      setError("Thiếu specialtyId/date/doctorId. Hãy quay lại bước trước.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/public/doctors/${doctorId}/slots?date=${date}`);
        if (!res.ok) throw new Error("Không tải được danh sách giờ khám.");
        const data = await res.json();
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [specialtyId, date, doctorId]);

  const onNext = () => {
    if (!selectedSlotId) {
      setError("Bạn chưa chọn giờ khám.");
      return;
    }
    navigate(
      `/book/step4?specialtyId=${specialtyId}&date=${date}&doctorId=${doctorId}&slotId=${selectedSlotId}`
    );
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Đặt lịch khám</h1>
            <p className="text-slate-600 mt-1">
              Bước 3: Chọn giờ khám • Ngày {date}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/book/step2?specialtyId=${specialtyId}`)}
            className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Quay lại bước 2
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-slate-600">Đang tải giờ khám...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {error}
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-slate-700">
              Bác sĩ này không có slot ACTIVE cho ngày <b>{date}</b>.
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((s) => {
                  const disabled = s.remaining <= 0;
                  const active = String(selectedSlotId) === String(s.slotId);

                  return (
                    <button
                      key={s.slotId}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedSlotId(s.slotId)}
                      className={[
                        "text-left rounded-2xl border p-4 transition",
                        disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white hover:shadow-md",
                        active ? "ring-2 ring-sky-300 border-sky-300" : ""
                      ].join(" ")}
                    >
                      <div className="font-extrabold text-slate-900">
                        {s.startTime} - {s.endTime}
                      </div>
                      <div className="text-slate-600 text-sm mt-1">
                        Phòng: <b>{s.roomName}</b>
                      </div>
                      <div className="text-slate-700 text-sm mt-2">
                        Còn chỗ: <b>{s.remaining}</b> / {s.capacity}
                      </div>
                      <div className="mt-3 text-sky-700 font-bold text-sm">
                        {disabled ? "Hết chỗ" : "Chọn"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onNext}
                  className="rounded-xl bg-sky-600 text-white px-5 py-3 font-extrabold hover:bg-sky-700"
                >
                  Tiếp tục →
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
