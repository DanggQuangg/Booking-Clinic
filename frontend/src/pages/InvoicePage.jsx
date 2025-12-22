import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function InvoicePage() {
  const q = useQuery();
  const appointmentId = q.get("appointmentId");
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      setError("Thiếu appointmentId.");
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/patient/invoice?appointmentId=${appointmentId}`);
        if (!res.ok) throw new Error("Không tải được hóa đơn.");
        setData(await res.json());
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [appointmentId]);

  const money = (x) => Number(x || 0).toLocaleString("vi-VN") + " đ";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hóa đơn khám bệnh</h1>
            <p className="text-slate-600 mt-1">In/Export: dùng Ctrl+P để in</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/book")}
            className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Đặt lịch mới
          </button>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6">
          {loading ? (
            <div className="text-slate-600">Đang tải hóa đơn...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {error}
            </div>
          ) : (
            <>
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-slate-600 font-semibold">Họ tên</div>
                  <div className="text-slate-900 font-extrabold text-lg">{data.patientName}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-600 font-semibold">STT (Mã lịch)</div>
                  <div className="text-slate-900 font-extrabold text-lg">#{data.appointmentId}</div>
                </div>
              </div>

              <hr className="my-5" />

              <div className="grid sm:grid-cols-2 gap-4 text-slate-800">
                <div><b>Bác sĩ:</b> {data.doctorName}</div>
                <div><b>Chuyên khoa:</b> {data.specialtyName}</div>
                <div><b>Ngày khám:</b> {data.appointmentDate}</div>
                <div><b>Giờ khám:</b> {data.startTime} - {data.endTime}</div>
              </div>

              <hr className="my-5" />

              <div className="space-y-2 text-slate-800">
                <div className="flex justify-between">
                  <span>Tiền khám</span>
                  <b>{money(data.baseFee)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Giảm BHYT</span>
                  <b>- {money(data.insuranceDiscount)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ</span>
                  <b>{money(data.servicesAmount)}</b>
                </div>

                <div className="flex justify-between text-lg mt-3">
                  <span className="font-extrabold">Tổng cộng</span>
                  <span className="font-extrabold">{money(data.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-slate-900 text-white px-5 py-3 font-extrabold hover:bg-black"
                >
                  In hóa đơn
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
