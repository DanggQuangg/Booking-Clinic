import { useEffect, useMemo, useState } from "react";
import { serviceBookingsApi } from "../../api/serviceBookingsApi";

function fmtMoney(n) {
  const x = Number(n || 0);
  return x.toLocaleString("vi-VN") + "₫";
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("date_desc"); // date_desc | date_asc

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  const queryObj = useMemo(
    () => ({ q: q.trim(), from: from || undefined, to: to || undefined, status, sort, page, size }),
    [q, from, to, status, sort, page, size]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const rs = await serviceBookingsApi.myHistory(queryObj);
        if (!mounted) return;

        setItems(rs?.items || []);
        setTotalPages(Number(rs?.totalPages || 0));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Không tải được lịch sử mua dịch vụ.");
        setItems([]);
        setTotalPages(0);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [queryObj]);

  // khi đổi filter thì reset về trang 0
  const applyFilters = () => setPage(0);
  const clearFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setStatus("ALL");
    setSort("date_desc");
    setPage(0);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800">Lịch sử mua dịch vụ</h1>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="text-xs font-extrabold text-slate-600">Tìm theo tên</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: xét nghiệm máu..."
              className="mt-1 w-full rounded-xl border px-3 py-2 font-semibold"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-600">Từ ngày</div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 font-semibold"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-600">Đến ngày</div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 font-semibold"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-600">Trạng thái</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 font-extrabold"
            >
              <option value="ALL">Tất cả</option>
              <option value="BOOKED">Đã đặt</option>
              <option value="DONE">Hoàn tất</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-600">Sắp xếp</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 font-extrabold"
            >
              <option value="date_desc">Mới nhất</option>
              <option value="date_asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl bg-sky-600 px-4 py-2 font-extrabold text-white hover:bg-sky-700"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border bg-white px-4 py-2 font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Xoá lọc
          </button>
        </div>

        {err ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {err}
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="mt-5 rounded-2xl border bg-white">
        {loading ? (
          <div className="p-10 text-center text-slate-600">Đang tải dữ liệu…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">Chưa có giao dịch nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs font-extrabold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">Khung giờ</th>
                  <th className="px-4 py-3 text-right">SL</th>
                  <th className="px-4 py-3 text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-4 py-3 font-bold text-slate-700">
                      {it.slotDate || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900">{it.serviceName}</div>
                      {it.note ? <div className="mt-1 text-xs text-slate-500">{it.note}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {it.startTime && it.endTime ? `${it.startTime} - ${it.endTime}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold">{it.quantity}</td>
                    <td className="px-4 py-3 text-right font-extrabold">{fmtMoney(it.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-black text-sky-700">
                      {fmtMoney(it.lineTotal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                        {it.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm font-semibold text-slate-600">
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border bg-white px-3 py-2 font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              ← Trước
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border bg-white px-3 py-2 font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
