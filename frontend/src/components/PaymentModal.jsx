import { useEffect, useState } from "react";

export default function PaymentModal({ open, onClose, onConfirm }) {
  const [method, setMethod] = useState("CASH");

  useEffect(() => {
    if (open) setMethod("CASH");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onMouseDown={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border" onMouseDown={(e) => e.stopPropagation()}>
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Chọn phương thức thanh toán</h2>
            <button onClick={onClose} className="border px-3 py-1 rounded-lg">Đóng</button>
          </div>

          <div className="p-5 space-y-3">
            <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={method === "CASH"}
                onChange={() => setMethod("CASH")}
              />
              <div>
                <div className="font-semibold">Tiền mặt</div>
                <div className="text-sm text-slate-500">Thanh toán tại phòng khám</div>
              </div>
            </label>

            <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={method === "TRANSFER"}
                onChange={() => setMethod("TRANSFER")}
              />
              <div>
                <div className="font-semibold">Chuyển khoản</div>
                <div className="text-sm text-slate-500">Xác nhận chuyển khoản</div>
              </div>
            </label>

            <button
              onClick={() => onConfirm(method)}
              className="w-full bg-sky-600 text-white py-2 rounded-xl font-bold"
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
