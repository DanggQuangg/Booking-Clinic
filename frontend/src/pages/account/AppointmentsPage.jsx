import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../lib/api";

const TABS = [
  { key: "UPCOMING", label: "Lịch hẹn khám" },
  { key: "REGISTERED", label: "Đã đăng ký" },
  { key: "DONE", label: "Đã khám" },
];

function fmtDate(isoDate) {
  // isoDate: "2025-12-23"
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function fmtTime(t) {
  if (!t) return "";
  return t.slice(0, 5);
}

function moneyVND(x) {
  if (x == null) return "0 ₫";
  const n = Number(x);
  if (Number.isNaN(n)) return `${x} ₫`;
  return n.toLocaleString("vi-VN") + " ₫";
}

function Badge({ children, tone = "slate" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "yellow"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "red"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function statusBadge(status, paymentStatus) {
  // status: AWAITING_PAYMENT | CONFIRMED | DONE | CANCELLED | NO_SHOW...
  if (status === "DONE") return <Badge tone="green">Đã khám</Badge>;
  if (status === "CONFIRMED") return <Badge tone="green">Đã xác nhận</Badge>;
  if (status === "AWAITING_PAYMENT") return <Badge tone="yellow">Chờ thanh toán</Badge>;
  if (status === "CANCELLED") return <Badge tone="red">Đã huỷ</Badge>;
  if (status === "NO_SHOW") return <Badge tone="red">Vắng mặt</Badge>;
  // fallback
  return <Badge>{status || "UNKNOWN"}</Badge>;
}

function payBadge(paymentStatus) {
  if (paymentStatus === "PAID") return <Badge tone="green">Đã thanh toán</Badge>;
  if (paymentStatus === "UNPAID") return <Badge tone="yellow">Chưa thanh toán</Badge>;
  if (paymentStatus === "FAILED") return <Badge tone="red">Thanh toán lỗi</Badge>;
  if (paymentStatus === "REFUNDED") return <Badge>Hoàn tiền</Badge>;
  return <Badge>{paymentStatus || "UNKNOWN"}</Badge>;
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState("UPCOMING");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 });

  // =========================
  // Thuốc (PRESCRIPTION) theo lịch khám
  // =========================
  const [openRxId, setOpenRxId] = useState(null); // appointmentId đang mở thuốc
  const [rxLoadingId, setRxLoadingId] = useState(null);
  const [rxErr, setRxErr] = useState({});
  const [rxByAppt, setRxByAppt] = useState({}); // { [appointmentId]: [{id,itemKey,itemValue,createdAt}] }

  const hasData = useMemo(() => (data?.content?.length || 0) > 0, [data]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiGet(
        `/api/patient/appointments?bucket=${tab}&q=${encodeURIComponent(q || "")}&page=${page}&size=10`
      );
      setData(res);
    } catch (e) {
      setErr(e?.message || "Không tải được lịch khám");
      setData({ content: [], totalPages: 0, number: 0 });
    } finally {
      setLoading(false);
    }
  }

  async function loadPrescriptions(appointmentId) {
    setRxLoadingId(appointmentId);
    setRxErr((m) => ({ ...m, [appointmentId]: "" }));
    try {
      const res = await apiGet(`/api/patient/appointments/${appointmentId}/prescriptions`);
      setRxByAppt((m) => ({ ...m, [appointmentId]: Array.isArray(res) ? res : [] }));
    } catch (e) {
      setRxErr((m) => ({ ...m, [appointmentId]: e?.message || "Không tải được thuốc" }));
      setRxByAppt((m) => ({ ...m, [appointmentId]: [] }));
    } finally {
      setRxLoadingId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-extrabold text-slate-800">Lịch khám</div>
          <div className="mt-1 text-sm text-slate-600">
            Xem lịch hẹn, trạng thái thanh toán và chi tiết phí khám/dịch vụ.
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo hồ sơ / bác sĩ / chuyên khoa..."
            className="w-full sm:w-96 rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            onClick={() => {
              setPage(0);
              load();
            }}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
          >
            🔎 Tìm
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(0);
                setOpenRxId(null); // đóng panel thuốc khi đổi tab
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-bold border ${
                active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* States */}
      {loading && (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-6 text-slate-600">Đang tải lịch khám...</div>
      )}

      {!loading && err && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{err}</div>
      )}

      {!loading && !err && !hasData && (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-10 text-center">
          <div className="text-slate-600 font-semibold">Không có lịch nào trong mục này.</div>
          <div className="mt-1 text-sm text-slate-500">Thử đổi tab hoặc tìm kiếm theo tên hồ sơ / bác sĩ / chuyên khoa.</div>
        </div>
      )}

      {/* List */}
      {!loading && !err && hasData && (
        <div className="mt-6 space-y-3">
          {data.content.map((a) => (
            <div key={a.id} className="rounded-2xl border p-4 hover:bg-slate-50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-slate-800">
                    {fmtDate(a.appointmentDate)} • {fmtTime(a.startTime)} - {fmtTime(a.endTime)}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Hồ sơ:</span> {a.patientProfileName || `#${a.patientProfileId}`}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Bác sĩ:</span> {a.doctorName}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Chuyên khoa:</span> {a.specialtyName}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Phòng:</span> {a.roomName}
                  </div>

                  {a.note && (
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold">Ghi chú:</span> {a.note}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    {statusBadge(a.status, a.paymentStatus)}
                    {payBadge(a.paymentStatus)}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Tổng tiền</div>
                    <div className="text-lg font-extrabold text-slate-900">{moneyVND(a.totalAmount)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Phí khám: {moneyVND(a.baseFee)} • Giảm BHYT: {moneyVND(a.insuranceDiscount)} • Dịch vụ:{" "}
                      {moneyVND(a.servicesAmount)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => {
                        const next = openRxId === a.id ? null : a.id;
                        setOpenRxId(next);

                        // mở lần đầu thì gọi API (nếu chưa có cache)
                        if (next && rxByAppt[a.id] == null) {
                          loadPrescriptions(a.id);
                        }
                      }}
                      className="rounded-xl border px-3 py-2 text-sm font-bold hover:bg-white"
                    >
                      💊 {openRxId === a.id ? "Ẩn thuốc" : "Xem thuốc"}
                    </button>

                    <div className="text-xs text-slate-500">Mã lịch: #{a.id}</div>
                  </div>
                </div>
              </div>

              {/* Panel thuốc */}
              {openRxId === a.id && (
                <div className="mt-4 rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-slate-800">Danh sách thuốc</div>
                    <button
                      onClick={() => loadPrescriptions(a.id)}
                      className="rounded-xl border px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
                      disabled={rxLoadingId === a.id}
                    >
                      🔄 Tải lại
                    </button>
                  </div>

                  {rxLoadingId === a.id && <div className="mt-3 text-sm text-slate-600">Đang tải thuốc...</div>}

                  {rxLoadingId !== a.id && rxErr[a.id] && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      {rxErr[a.id]}
                    </div>
                  )}

                  {rxLoadingId !== a.id && !rxErr[a.id] && (rxByAppt[a.id]?.length || 0) === 0 && (
                    <div className="mt-3 text-sm text-slate-600">Chưa có đơn thuốc cho lịch khám này.</div>
                  )}

                  {rxLoadingId !== a.id && !rxErr[a.id] && (rxByAppt[a.id]?.length || 0) > 0 && (
                    <div className="mt-3 space-y-2">
                      {rxByAppt[a.id].map((it) => (
                        <div key={it.id} className="rounded-xl border p-3">
                          <div className="text-sm font-bold text-slate-800">{it.itemKey || "Thuốc"}</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            {it.itemValue || "(trống)"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-slate-600">
              Trang {data.number + 1} / {Math.max(1, data.totalPages)}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-50"
              >
                ◀ Trước
              </button>
              <button
                disabled={page >= (data.totalPages || 1) - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-50"
              >
                Sau ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
