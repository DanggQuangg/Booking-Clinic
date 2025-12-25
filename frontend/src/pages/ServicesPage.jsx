import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { servicesApi } from "../api/servicesApi";

/** ✅ Helper: bắt cả Axios + Fetch wrapper (message kiểu "HTTP 403") */
function getErrMsg(e) {
  // 1) Axios style
  const status1 = e?.response?.status;

  // 2) Some wrappers put status directly
  const status2 = e?.status || e?.statusCode;

  // 3) Parse from message: "HTTP 403", "status code 403", ...
  const msgText = String(e?.message || "");
  const m = msgText.match(/\b(401|403)\b/); // lấy 401/403 nếu có
  const status3 = m ? Number(m[1]) : null;

  const status = status1 || status2 || status3;

  if (status === 401 || status === 403) {
    return "Hãy đăng nhập để tiếp tục.";
  }

  // Backend message (nếu có)
  const backendMsg = e?.response?.data?.message;
  if (backendMsg) return backendMsg;

  // Fallback
  return msgText || "Không tải được danh sách dịch vụ";
}

export default function ServicesPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [services, setServices] = useState([]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("price_asc"); // price_asc | price_desc

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await servicesApi.list();
        if (!mounted) return;

        const list = Array.isArray(data) ? data : data?.items || [];
        setServices(list);
      } catch (e) {
        if (!mounted) return;
        setErr(getErrMsg(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let list = services;

    if (kw) {
      list = list.filter((s) => {
        const name = String(s?.name || "").toLowerCase();
        const desc = String(s?.description || "").toLowerCase();
        return name.includes(kw) || desc.includes(kw);
      });
    }

    list = [...list].sort((a, b) => {
      const pa = Number(a?.price || 0);
      const pb = Number(b?.price || 0);
      return sort === "price_desc" ? pb - pa : pa - pb;
    });

    return list;
  }, [services, q, sort]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Các dịch vụ thêm</h1>
            <p className="mt-1 text-sm text-slate-600">
              Xét nghiệm, tiêm, đo sinh hiệu, dịch vụ đi kèm…
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm dịch vụ (vd: xét nghiệm máu, đường huyết...)"
              className="w-full md:w-[360px] rounded-2xl border bg-white px-4 py-2.5 font-semibold outline-none focus:ring-2 focus:ring-sky-200"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border bg-white px-4 py-2.5 font-extrabold text-slate-800"
            >
              <option value="price_asc">Giá: thấp → cao</option>
              <option value="price_desc">Giá: cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              Đang tải danh sách dịch vụ…
            </div>
          ) : err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
              {err}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-500">
              Không có dịch vụ phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => {
                const requiresBooking = true;
                const status = s?.status;

                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/services/${s.id}`)}
                    className="text-left rounded-2xl border bg-white p-4 transition hover:shadow-md"
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-extrabold text-slate-900">{s?.name}</div>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {s?.description || "—"}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-bold text-slate-500">GIÁ</div>
                        <div className="text-lg font-black text-sky-700">
                          {Number(s?.price || 0).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {requiresBooking ? (
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                          Cần đặt theo giờ
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                          Dịch vụ đi kèm
                        </span>
                      )}

                      {status ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                          {status}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
