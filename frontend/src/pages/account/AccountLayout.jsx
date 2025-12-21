import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header";

const items = [
  { label: "Lịch khám", to: "/account/appointments" },
  { label: "Lịch sử thanh toán", to: "/account/payments" },
  { label: "Hồ sơ", to: "/account/profile" },
  { label: "Tài khoản", to: "/account/settings" },
];

export default function AccountLayout() {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-[calc(100vh-110px)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <div className="text-sm font-extrabold text-slate-800">Tài khoản</div>
                  <div className="text-xs text-slate-500">Quản lý lịch khám & hồ sơ</div>
                </div>

                <nav className="p-2">
                  {items.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        [
                          "block rounded-xl px-4 py-3 text-sm font-semibold transition",
                          isActive
                            ? "bg-sky-50 text-sky-700 border-l-4 border-sky-600"
                            : "text-slate-700 hover:bg-slate-50",
                        ].join(" ")
                      }
                      end
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <section className="col-span-12 md:col-span-8 lg:col-span-9">
              <div className="rounded-2xl border bg-white shadow-sm p-5">
                <Outlet />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
