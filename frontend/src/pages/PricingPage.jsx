import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";

function formatVND(value) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN") + " đ";
}

export default function PricingPage() {
  const [mode, setMode] = useState("SPECIALTY"); 
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [services, setServices] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const [spRes, svRes] = await Promise.all([
          fetch("/api/public/pricing/specialties"),
          fetch("/api/public/pricing/services"),
        ]);

        if (!spRes.ok) throw new Error("Không tải được bảng giá chuyên khoa");
        if (!svRes.ok) throw new Error("Không tải được bảng giá dịch vụ");

        const spData = await spRes.json();
        const svData = await svRes.json();

        if (!cancelled) {
          setSpecialties(Array.isArray(spData) ? spData : []);
          setServices(Array.isArray(svData) ? svData : []);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const list = mode === "SPECIALTY" ? specialties : services;

    if (!keyword) return list;

    return list.filter((it) => {
      const name = (it.name || "").toLowerCase();
      const desc = (it.description || "").toLowerCase();
      return name.includes(keyword) || desc.includes(keyword);
    });
  }, [mode, q, specialties, services]);

  return (
    <>
    <Header />
    <div className="bg-slate-50 min-h-[calc(100vh-120px)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">Bảng giá</h1>
            <p className="text-slate-600 mt-1">
              Tra cứu nhanh giá khám theo chuyên khoa hoặc giá các dịch vụ thêm.
            </p>
          </div>

          {/* Toggle */}
          <div className="inline-flex rounded-2xl border bg-white p-1 shadow-sm w-full md:w-auto">
            <button
              type="button"
              onClick={() => setMode("SPECIALTY")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-2xl font-extrabold text-sm transition ${
                mode === "SPECIALTY" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Giá khám theo chuyên khoa
            </button>
            <button
              type="button"
              onClick={() => setMode("SERVICE")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-2xl font-extrabold text-sm transition ${
                mode === "SERVICE" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Giá dịch vụ thêm
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <SearchIcon />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === "SPECIALTY" ? "Tìm chuyên khoa (VD: Tai mũi họng...)" : "Tìm dịch vụ (VD: Xét nghiệm máu...)"}
              className="w-full outline-none text-slate-900 placeholder:text-slate-400"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-sm font-bold text-slate-600 hover:text-slate-900"
                title="Xóa"
              >
                Xóa
              </button>
            ) : null}
          </div>

          <div className="mt-2 text-sm text-slate-600">
            {loading ? "Đang tải..." : `Tìm thấy ${filtered.length} mục`}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {err}
            </div>
          ) : loading ? (
            <SkeletonList />
          ) : mode === "SPECIALTY" ? (
            <SpecialtyList items={filtered} />
          ) : (
            <ServiceList items={filtered} />
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-xs text-slate-500">
          * Giá hiển thị mang tính tham khảo. Vui lòng liên hệ nếu cần báo giá chi tiết theo tình trạng bệnh.
        </div>
      </div>
    </div>
    </>
  );
}

function SpecialtyList({ items }) {
  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Empty />
      ) : (
        items.map((it) => (
          <div key={it.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="min-w-0">
                <div className="text-lg font-black text-slate-900 truncate">{it.name}</div>
                {it.description ? <div className="text-sm text-slate-600 mt-1">{it.description}</div> : null}

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
                    Bác sĩ: {it.doctorCount ?? 0}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
                    Khoảng giá: {formatVND(it.minFee)} – {formatVND(it.maxFee)}
                  </span>
                </div>
              </div>

              <div className="md:text-right">
                <div className="text-xs font-bold text-slate-500">Giá khám (tham khảo)</div>
                <div className="text-xl font-black text-sky-700">
                  {formatVND(it.minFee)} <span className="text-slate-400 font-extrabold">~</span> {formatVND(it.maxFee)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ServiceList({ items }) {
  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Empty />
      ) : (
        items.map((it) => (
          <div key={it.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="min-w-0">
                <div className="text-lg font-black text-slate-900 truncate">{it.name}</div>
                {it.description ? <div className="text-sm text-slate-600 mt-1">{it.description}</div> : null}
                {it.status ? (
                  <div className="mt-2 text-xs">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 font-extrabold ${
                        it.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {it.status === "ACTIVE" ? "Đang cung cấp" : "Tạm ngưng"}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="md:text-right">
                <div className="text-xs font-bold text-slate-500">Giá</div>
                <div className="text-xl font-black text-sky-700">{formatVND(it.price)}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center text-slate-600 shadow-sm">
      Không có dữ liệu phù hợp.
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="h-5 w-2/3 bg-slate-100 rounded" />
          <div className="mt-3 h-4 w-1/2 bg-slate-100 rounded" />
          <div className="mt-3 h-4 w-1/3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
