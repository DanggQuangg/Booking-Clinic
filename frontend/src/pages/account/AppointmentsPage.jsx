import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";

const TABS = [
  { key: "UPCOMING", label: "Đã đăng kí/Lịch hẹn khám" },
  { key: "REGISTERED", label: "Chưa thanh toán" },
  { key: "DONE", label: "Đã khám" },
];

function fmtDate(isoDate) {
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
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

function statusBadge(status) {
  if (status === "DONE") return <Badge tone="green">Đã khám</Badge>;
  if (status === "CONFIRMED") return <Badge tone="green">Đã xác nhận</Badge>;
  if (status === "AWAITING_PAYMENT") return <Badge tone="yellow">Chờ thanh toán</Badge>;
  if (status === "CANCELLED") return <Badge tone="red">Đã huỷ</Badge>;
  if (status === "NO_SHOW") return <Badge tone="red">Vắng mặt</Badge>;
  return <Badge>{status || "UNKNOWN"}</Badge>;
}

function payBadge(paymentStatus) {
  if (paymentStatus === "PAID") return <Badge tone="green">Đã thanh toán</Badge>;
  if (paymentStatus === "UNPAID") return <Badge tone="yellow">Chưa thanh toán</Badge>;
  if (paymentStatus === "FAILED") return <Badge tone="red">Thanh toán lỗi</Badge>;
  if (paymentStatus === "REFUNDED") return <Badge>Hoàn tiền</Badge>;
  return <Badge>{paymentStatus || "UNKNOWN"}</Badge>;
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
function fmtFollowUp(obj) {
  if (!obj) return null;
  const date = obj.date ? fmtDate(obj.date) : "";
  const time = obj.time ? obj.time : "";
  const note = obj.note ? obj.note : "";
  return { date, time, note };
}

// ===== helpers cho record =====
function groupItems(items = []) {
  const byType = {};
  for (const it of items) {
    const t = (it?.itemType || "OTHER").toUpperCase();
    if (!byType[t]) byType[t] = [];
    byType[t].push(it);
  }
  return byType;
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState("UPCOMING");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 });

  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [paying, setPaying] = useState(false);

  // Record modal state
  const [recordOpen, setRecordOpen] = useState(false);
  const [recordTarget, setRecordTarget] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordErr, setRecordErr] = useState("");
  const [recordData, setRecordData] = useState(null);

  // =========================
  // Thuốc (PRESCRIPTION) theo lịch khám
  // =========================
  const [openRxId, setOpenRxId] = useState(null); // appointmentId đang mở thuốc
  const [rxLoadingId, setRxLoadingId] = useState(null);
  const [rxErr, setRxErr] = useState({});
  const [rxByAppt, setRxByAppt] = useState({}); // { [appointmentId]: [] }

  const hasData = useMemo(() => (data?.content?.length || 0) > 0, [data]);

  async function loadBucket(bucket, pageNo, query) {
    setLoading(true);
    setErr("");
    try {
      const res = await apiGet(
        `/api/patient/appointments?bucket=${bucket}&q=${encodeURIComponent(
          query || ""
        )}&page=${pageNo}&size=10`
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
      const res = await apiGet(
        `/api/patient/appointments/${appointmentId}/prescriptions`
      );
      setRxByAppt((m) => ({ ...m, [appointmentId]: Array.isArray(res) ? res : [] }));
    } catch (e) {
      setRxErr((m) => ({
        ...m,
        [appointmentId]: e?.message || "Không tải được thuốc",
      }));
      setRxByAppt((m) => ({ ...m, [appointmentId]: [] }));
    } finally {
      setRxLoadingId(null);
    }
  }

  useEffect(() => {
    loadBucket(tab, page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setPage(0);
      loadBucket(tab, 0, q);
    }
  };

  // ===== thanh toán =====
  const canPay = (a) =>
    a?.status === "AWAITING_PAYMENT" && a?.paymentStatus === "UNPAID";

  const openPay = (appt) => {
    setPayTarget(appt);
    setPayOpen(true);
  };

  const confirmPay = async (method) => {
    if (!payTarget?.id) return;

    setPaying(true);
    try {
      // ✅ đồng bộ với backend đã merge: POST /api/patient/appointments/{id}/confirm
      await apiPost(`/api/patient/appointments/${payTarget.id}/confirm`, { method });

      alert("Thanh toán thành công! Lịch đã được xác nhận.");

      setPayOpen(false);
      setPayTarget(null);

      // đưa về UPCOMING để thấy lịch vừa confirm
      setTab("UPCOMING");
      setPage(0);
      await loadBucket("UPCOMING", 0, q);
    } catch (e) {
      alert(e?.message || "Lỗi thanh toán");
    } finally {
      setPaying(false);
    }
  };

  // ===== huỷ lịch =====
  const canCancel = (a) => {
    const st = (a?.status || "").toUpperCase();
    return st !== "DONE" && st !== "CANCELLED" && st !== "NO_SHOW";
  };

  const cancelAppointment = async (appt) => {
    if (!appt?.id) return;

    const ok = window.confirm(`Bạn chắc chắn muốn hủy lịch #${appt.id} ?`);
    if (!ok) return;

    try {
      await apiPost(`/api/patient/appointments/${appt.id}/cancel`, {});
      alert("✅ Đã hủy lịch thành công!");
      await loadBucket(tab, page, q);
    } catch (e) {
      alert(e?.message || "❌ Hủy lịch thất bại");
    }
  };

  // ===== xem bệnh án / đơn thuốc (record) =====
  const canViewRecord = (a) => a?.status === "DONE";

  const openRecord = async (appt) => {
    setRecordTarget(appt);
    setRecordOpen(true);
    setRecordErr("");
    setRecordData(null);

    if (!appt?.id) return;

    setRecordLoading(true);
    try {
      const res = await apiGet(`/api/patient/appointments/${appt.id}/record`);
      setRecordData(res);
    } catch (e) {
      setRecordErr(e?.message || "Không tải được đơn thuốc/bệnh án");
      setRecordData(null);
    } finally {
      setRecordLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-extrabold text-slate-800">Lịch khám</div>
          <div className="mt-1 text-sm text-slate-600">
            Xem lịch hẹn, trạng thái thanh toán và chi tiết phí khám/dịch vụ.
          </div>
        </div>

        {/* Reload */}
        <button
          onClick={() => {
            setPage(0);
            loadBucket(tab, 0, q);
          }}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <span>🔄</span> Tải lại
        </button>
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
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Tìm: mã lịch (id), tên hồ sơ, tên bác sĩ, chuyên khoa, phòng..."
          className="w-full sm:w-[520px] rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
        <button
          onClick={() => {
            setPage(0);
            loadBucket(tab, 0, q);
          }}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
        >
          🔎 Tìm
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-6 text-slate-600">
          Đang tải lịch khám...
        </div>
      )}

      {!loading && err && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {err}
        </div>
      )}

      {!loading && !err && !hasData && (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-10 text-center">
          <div className="text-slate-600 font-semibold">
            Không có lịch nào trong mục này.
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Thử đổi tab hoặc tìm kiếm theo tên hồ sơ / bác sĩ / chuyên khoa.
          </div>
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
                    {fmtDate(a.appointmentDate)} • {fmtTime(a.startTime)} -{" "}
                    {fmtTime(a.endTime)}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Hồ sơ:</span>{" "}
                    {a.patientProfileName || `#${a.patientProfileId}`}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Bác sĩ:</span> {a.doctorName}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Chuyên khoa:</span>{" "}
                    {a.specialtyName}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Phòng:</span> {a.roomName}
                  </div>

                  {a.note && (
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold">Ghi chú:</span> {a.note}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canPay(a) && (
                      <button
                        onClick={() => openPay(a)}
                        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
                      >
                        💳 Thanh toán
                      </button>
                    )}

                    {canCancel(a) && (
                      <button
                        onClick={() => cancelAppointment(a)}
                        className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                      >
                        🗑️ Huỷ lịch
                      </button>
                    )}

                    {canViewRecord(a) && (
                      <button
                        onClick={() => openRecord(a)}
                        className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
                      >
                        📄 Xem đơn thuốc
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    {statusBadge(a.status)}
                    {payBadge(a.paymentStatus)}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Tổng tiền</div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {moneyVND(a.totalAmount)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Phí khám: {moneyVND(a.baseFee)} • Giảm BHYT:{" "}
                      {moneyVND(a.insuranceDiscount)} • Dịch vụ:{" "}
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
                    <div className="text-sm font-extrabold text-slate-800">
                      Danh sách thuốc
                    </div>
                    <button
                      onClick={() => loadPrescriptions(a.id)}
                      className="rounded-xl border px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
                      disabled={rxLoadingId === a.id}
                    >
                      🔄 Tải lại
                    </button>
                  </div>

                  {rxLoadingId === a.id && (
                    <div className="mt-3 text-sm text-slate-600">
                      Đang tải thuốc...
                    </div>
                  )}

                  {rxLoadingId !== a.id && rxErr[a.id] && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      {rxErr[a.id]}
                    </div>
                  )}

                  {rxLoadingId !== a.id &&
                    !rxErr[a.id] &&
                    (rxByAppt[a.id]?.length || 0) === 0 && (
                      <div className="mt-3 text-sm text-slate-600">
                        Chưa có đơn thuốc cho lịch khám này.
                      </div>
                    )}

                  {rxLoadingId !== a.id &&
                    !rxErr[a.id] &&
                    (rxByAppt[a.id]?.length || 0) > 0 && (
                      <div className="mt-3 space-y-2">
                        {rxByAppt[a.id].map((it) => (
                          <div key={it.id} className="rounded-xl border p-3">
                            <div className="text-sm font-bold text-slate-800">
                              {it.itemKey || "Thuốc"}
                            </div>
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

      {/* Payment Modal */}
      <PaymentModal
        open={payOpen}
        paying={paying}
        appointment={payTarget}
        onClose={() => {
          if (paying) return;
          setPayOpen(false);
          setPayTarget(null);
        }}
        onConfirm={confirmPay}
      />

      {/* Record Modal */}
      <RecordModal
        open={recordOpen}
        loading={recordLoading}
        err={recordErr}
        appointment={recordTarget}
        record={recordData}
        onClose={() => {
          if (recordLoading) return;
          setRecordOpen(false);
          setRecordTarget(null);
          setRecordErr("");
          setRecordData(null);
        }}
      />
    </div>
  );
}

/** Modal chọn 1 trong 2 phương thức */
function PaymentModal({ open, paying, appointment, onClose, onConfirm }) {
  const [method, setMethod] = useState("CASH");

  useEffect(() => {
    if (open) setMethod("CASH");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onMouseDown={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-xl border"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Thanh toán lịch hẹn</h2>
            <button
              disabled={paying}
              onClick={onClose}
              className="border px-3 py-1 rounded-lg disabled:opacity-50"
            >
              Đóng
            </button>
          </div>

          <div className="p-5 space-y-3">
            <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Mã lịch:</span> #{appointment?.id}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Tổng tiền:</span>{" "}
                {moneyVND(appointment?.totalAmount)}
              </div>
            </div>

            <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={method === "CASH"}
                onChange={() => setMethod("CASH")}
                disabled={paying}
              />
              <div>
                <div className="font-semibold">Tiền mặt</div>
                <div className="text-sm text-slate-500">
                  Thanh toán tại phòng khám
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={method === "TRANSFER"}
                onChange={() => setMethod("TRANSFER")}
                disabled={paying}
              />
              <div>
                <div className="font-semibold">Chuyển khoản</div>
                <div className="text-sm text-slate-500">
                  Xác nhận đã chuyển khoản
                </div>
              </div>
            </label>

            <button
              disabled={paying}
              onClick={() => onConfirm(method)}
              className="w-full bg-sky-600 text-white py-2 rounded-xl font-bold disabled:opacity-60"
            >
              {paying ? "Đang xác nhận..." : "Xác nhận thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Modal xem bệnh án / đơn thuốc */
function RecordModal({ open, loading, err, appointment, record, onClose }) {
  if (!open) return null;

  const items = record?.items || [];
  const byType = groupItems(items);

  const vitals = byType["VITAL_SIGN"] || [];
  const prescriptions = byType["PRESCRIPTION"] || [];
  const tests = byType["TEST"] || [];
  const notes = byType["NOTE"] || [];
  const symptoms = byType["SYMPTOM"] || [];

  const followUpItem = notes.find(
    (x) => String(x?.itemKey || "").trim().toUpperCase() === "FOLLOW_UP"
  );
  const followUpObjRaw = followUpItem ? safeJsonParse(followUpItem.itemValue) : null;
  const followUp = fmtFollowUp(followUpObjRaw);

  const normalNotes = notes.filter(
    (x) => String(x?.itemKey || "").trim().toUpperCase() !== "FOLLOW_UP"
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onMouseDown={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold">Đơn thuốc / Bệnh án</div>
              <div className="text-sm text-slate-500">
                Mã lịch: #{appointment?.id}
              </div>
            </div>
            <button
              disabled={loading}
              onClick={onClose}
              className="border px-3 py-1 rounded-lg disabled:opacity-50"
            >
              Đóng
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-auto">
            {loading && (
              <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
                Đang tải đơn thuốc...
              </div>
            )}

            {!loading && err && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 font-semibold">
                {err}
              </div>
            )}

            {!loading && !err && !record && (
              <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
                Chưa có bệnh án cho lịch này.
              </div>
            )}

            {!loading && !err && record && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border p-4">
                    <div className="text-xs font-extrabold text-slate-600">
                      Chẩn đoán
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-slate-800 font-semibold">
                      {record?.diagnosis || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs font-extrabold text-slate-600">
                      Kết luận & Lời dặn
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-slate-800 font-semibold">
                      {record?.conclusion || "—"}
                    </div>
                  </div>
                </div>

                {followUp && (followUp.date || followUp.time || followUp.note) && (
                  <div className="rounded-xl border p-4">
                    <div className="text-sm font-extrabold text-slate-800">
                      Lịch tái khám
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="rounded-xl border bg-slate-50 p-3">
                        <div className="text-xs font-extrabold text-slate-600">
                          Ngày
                        </div>
                        <div className="mt-1 font-black text-slate-900">
                          {followUp.date || "—"}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-slate-50 p-3">
                        <div className="text-xs font-extrabold text-slate-600">
                          Giờ
                        </div>
                        <div className="mt-1 font-black text-slate-900">
                          {followUp.time || "—"}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-slate-50 p-3">
                        <div className="text-xs font-extrabold text-slate-600">
                          Ghi chú
                        </div>
                        <div className="mt-1 font-black text-slate-900 whitespace-pre-wrap">
                          {followUp.note || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border p-4">
                  <div className="text-sm font-extrabold text-slate-800">Sinh hiệu</div>
                  {vitals.length === 0 ? (
                    <div className="mt-2 text-sm text-slate-500">
                      Không có dữ liệu sinh hiệu.
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vitals.map((it, idx) => (
                        <div key={idx} className="rounded-xl border bg-slate-50 p-3">
                          <div className="text-xs font-extrabold text-slate-600">
                            {it.itemKey || "—"}
                          </div>
                          <div className="mt-1 font-black text-slate-900">
                            {it.itemValue || "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-sm font-extrabold text-slate-800">Đơn thuốc</div>
                  {prescriptions.length === 0 ? (
                    <div className="mt-2 text-sm text-slate-500">Không có thuốc.</div>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="bg-slate-50 text-xs font-extrabold text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Thuốc</th>
                            <th className="px-3 py-2">Cách dùng / Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {prescriptions.map((it, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2 font-extrabold text-slate-900">
                                {it.itemKey || "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-700 whitespace-pre-wrap">
                                {it.itemValue || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {(symptoms.length + tests.length + normalNotes.length) > 0 && (
                  <div className="rounded-xl border p-4 space-y-3">
                    {symptoms.length > 0 && (
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">
                          Triệu chứng
                        </div>
                        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {symptoms.map((it, idx) => (
                            <li key={idx}>
                              <span className="font-semibold">{it.itemKey}:</span>{" "}
                              {it.itemValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tests.length > 0 && (
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">
                          Xét nghiệm
                        </div>
                        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {tests.map((it, idx) => (
                            <li key={idx}>
                              <span className="font-semibold">{it.itemKey}:</span>{" "}
                              {it.itemValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {normalNotes.length > 0 && (
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">
                          Ghi chú
                        </div>
                        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {normalNotes.map((it, idx) => (
                            <li key={idx}>
                              <span className="font-semibold">{it.itemKey}:</span>{" "}
                              {it.itemValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
