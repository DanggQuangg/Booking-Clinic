import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function BookStep1Specialty() {
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:8080/api/public/specialties");
        if (!res.ok) throw new Error("Không tải được danh sách chuyên khoa.");
        const data = await res.json();
        setSpecialties(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Đặt lịch khám</h1>
            <p className="text-slate-600 mt-1">Bước 1: Chọn chuyên khoa</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Về trang chủ
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-slate-600">Đang tải chuyên khoa...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {error}
            </div>
          ) : specialties.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-slate-700">
              Chưa có chuyên khoa trong database. Hãy seed bảng <b>specialties</b>.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/book/step2?specialtyId=${s.id}`)}
                  className="text-left rounded-2xl border bg-white p-4 hover:shadow-md transition"
                >
                  <div className="font-extrabold text-slate-900 text-lg">{s.name}</div>
                  <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                    {s.description || "Chưa có mô tả"}
                  </div>
                  <div className="mt-3 text-sky-700 font-bold text-sm">
                    Chọn chuyên khoa →
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
