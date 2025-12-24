import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiGet, apiPost } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function InvoicePage() {
  const q = useQuery();
  const appointmentId = q.get("appointmentId") || q.get("appointmentIdd");
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // payment states
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState("CASH");
  const [payMsg, setPayMsg] = useState("");

  const money = (x) => Number(x || 0).toLocaleString("vi-VN") + " đ";

  const loadInvoice = async () => {
    if (!appointmentId) {
      setLoading(false);
      setError("Thiếu appointmentId (URL phải có ?appointmentId=...).");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPayMsg("");

      const json = await apiGet(`/api/patient/invoice?appointmentId=${appointmentId}`);
      setData(json);
    } catch (e) {
      // show rõ lỗi
      setError(e?.message || "Không tải được hóa đơn.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const canPay =
    !!data &&
    (data.paymentStatus === "UNPAID" || data.paymentStatus === "FAILED") &&
    !paying;

  // ✅ helper: show error chi tiết hơn
  const normalizeErr = (e) => {
    if (!e) return "Thanh toán thất bại (unknown error).";
    if (typeof e === "string") return e;
    // nhiều lib sẽ trả {message}
    if (e.message) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return "Thanh toán thất bại.";
    }
  };

  const onPay = async () => {
    // ✅ đảm bảo có data
    if (!data?.appointmentId && !appointmentId) {
      setError("Thiếu appointmentId để thanh toán.");
      return;
    }

    const apptId = Number(data?.appointmentId || appointmentId);

    try {
      setPaying(true);
      setError("");
      setPayMsg("");

      // ✅ dấu hiệu chắc chắn click chạy
      console.log("[PAY] request:", { appointmentId: apptId, method: payMethod });

      const res = await apiPost("/api/patient/pay", {
        appointmentId: apptId,
        method: payMethod,
      });

      console.log("[PAY] response:", res);

      setPayMsg("✅ Thanh toán thành công! Đang cập nhật hóa đơn...");
      await loadInvoice();

      // ✅ tuỳ chọn: tự quay về lịch hẹn sau 1.2s
      // setTimeout(() => navigate("/patient/appointments"), 1200);

    } catch (e) {
      console.error("[PAY] error:", e);
      setError(normalizeErr(e));
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hóa đơn khám bệnh</h1>
            <p className="text-slate-600 mt-1">In/Export: dùng Ctrl+P để in</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate("/book")}
              className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Đặt lịch mới
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6">
          {loading ? (
            <div className="text-slate-600">Đang tải hóa đơn...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold whitespace-pre-wrap">
              {error}
            </div>
          ) : !data ? (
            <div className="text-slate-600">Không có dữ liệu hóa đơn.</div>
          ) : (
            <>
              {payMsg ? (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 font-semibold">
                  {payMsg}
                </div>
              ) : null}

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
                <div>
                  <b>Trạng thái thanh toán:</b>{" "}
                  <span className="font-extrabold">{data.paymentStatus}</span>
                </div>
                {data.paidAt ? <div><b>Đã thanh toán lúc:</b> {data.paidAt}</div> : null}
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

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                {/* Payment block */}
                {data.paymentStatus !== "PAID" ? (
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="rounded-xl border px-4 py-3 font-semibold text-slate-800 bg-white"
                      disabled={paying}
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="MOMO">MoMo</option>
                      <option value="ZALOPAY">ZaloPay</option>
                      <option value="VNPAY">VNPay</option>
                      <option value="CARD">Thẻ</option>
                    </select>

                    <button
                      type="button"
                      onClick={onPay}
                      disabled={!canPay}
                      className={`rounded-xl px-5 py-3 font-extrabold text-white ${
                        canPay ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"
                      }`}
                    >
                      {paying ? "Đang thanh toán..." : "Thanh toán"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-extrabold text-emerald-800">
                    ✅ Hóa đơn đã thanh toán
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-slate-900 text-white px-5 py-3 font-extrabold hover:bg-black"
                >
                  In hóa đơn
                </button>
              </div>

              {/* ✅ DEBUG nhỏ để bạn biết chắc đang nhận appointmentId đúng */}
              <div className="mt-4 text-xs text-slate-400">
                DEBUG: appointmentId(url)={String(appointmentId)} | appointmentId(data)=
                {String(data?.appointmentId)} | paymentStatus={String(data?.paymentStatus)}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
