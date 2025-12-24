import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut, apiPatch } from "../../lib/api";

const emptyForm = {
  fullName: "",
  phone: "",
  dob: "",
  gender: "MALE",
  citizenId: "",
  healthInsuranceCode: "",
  address: "",
  ethnicity: "",
  isDefault: false,
};

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
      {children}
    </span>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeId, setActiveId] = useState(null);

  const title = useMemo(() => (mode === "create" ? "Tạo hồ sơ" : "Chỉnh sửa hồ sơ"), [mode]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await apiGet("/api/patient/profiles/stats");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Không tải được danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setMode("create");
    setActiveId(null);
    setForm(emptyForm);
    setErr("");
    setOpen(true);
  };

  const openEdit = (p) => {
    setMode("edit");
    setActiveId(p.id);
    setForm({
      fullName: p.fullName || "",
      phone: p.phone || "",
      dob: p.dob || "",
      gender: p.gender || "MALE",
      citizenId: p.citizenId || "",
      healthInsuranceCode: p.healthInsuranceCode || "",
      address: p.address || "",
      ethnicity: p.ethnicity || "",
      isDefault: !!p.isDefault,
    });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    if (!form.fullName.trim()) {
      setErr("Vui lòng nhập họ tên.");
      return;
    }

    setSaving(true);
    setErr("");
    try {
      const payload = {
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        citizenId: form.citizenId.trim() || null,
        healthInsuranceCode: form.healthInsuranceCode.trim() || null,
        address: form.address.trim() || null,
        ethnicity: form.ethnicity.trim() || null,
        dob: form.dob || null,
      };

      if (mode === "create") {
        await apiPost("/api/patient/profiles", payload);
      } else {
        await apiPut(`/api/patient/profiles/${activeId}`, payload);
      }

      setOpen(false);
      await load();
    } catch (e) {
      // backend trả {message}
      const msg = e?.response?.data?.message || e?.message || "Lưu thất bại.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id) => {
    try {
      await apiPatch(`/api/patient/profiles/${id}/default`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Không đặt mặc định được.");
    }
  };

  const remove = async (p) => {
    // chặn xóa ngay từ UI: nếu đã từng có appointment thì không cho xóa
    const hasAny = (p.countNotVisited || 0) + (p.countDone || 0) + (p.countUpcoming || 0) > 0;
    if (hasAny) {
      alert("Không thể xóa: hồ sơ này đã từng đặt lịch khám.");
      return;
    }
    if (!confirm(`Xóa hồ sơ "${p.fullName}"?`)) return;

    try {
      await apiDelete(`/api/patient/profiles/${p.id}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Xóa thất bại.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Hồ sơ bệnh nhân</h1>
          <p className="mt-1 text-slate-600">
            Quản lý hồ sơ (thêm/sửa/xóa). Hồ sơ đã từng đặt lịch sẽ không được xóa.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-extrabold text-white hover:bg-emerald-700"
        >
          + Tạo hồ sơ
        </button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-8 text-slate-600">Đang tải...</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-slate-50 p-8 text-center text-slate-500">
          Chưa có hồ sơ nào.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {rows.map((p) => {
            const notVisited = p.countNotVisited || 0;
            const done = p.countDone || 0;
            const upcoming = p.countUpcoming || 0;
            const hasAny = notVisited + done + upcoming > 0;

            return (
              <div key={p.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-extrabold text-slate-900">{p.fullName}</div>
                      {p.isDefault ? <Badge>Mặc định</Badge> : null}
                    </div>

                    <div className="mt-2 text-sm text-slate-600 space-y-1">
                      <div>
                        SĐT: <b className="text-slate-800">{p.phone || "—"}</b> • DOB:{" "}
                        <b className="text-slate-800">{p.dob || "—"}</b> • Giới tính:{" "}
                        <b className="text-slate-800">{p.gender || "—"}</b>
                      </div>
                      <div>
                        CCCD: <b className="text-slate-800">{p.citizenId || "—"}</b> • BHYT:{" "}
                        <b className="text-slate-800">{p.healthInsuranceCode || "—"}</b>
                      </div>
                      <div>
                        Dân tộc: <b className="text-slate-800">{p.ethnicity || "—"}</b> • Địa chỉ:{" "}
                        <b className="text-slate-800">{p.address || "—"}</b>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>Chưa khám: {notVisited}</Badge>
                      <Badge>Đã khám: {done}</Badge>
                      <Badge>Lịch hẹn: {upcoming}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!p.isDefault ? (
                      <button
                        onClick={() => setDefault(p.id)}
                        className="rounded-xl border px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Đặt mặc định
                      </button>
                    ) : null}

                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-xl border px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => remove(p)}
                      className="rounded-xl border px-3 py-2 font-extrabold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={hasAny}
                      title={hasAny ? "Hồ sơ đã từng đặt lịch nên không thể xóa" : "Xóa hồ sơ"}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold text-slate-900">{title}</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-3 py-1 font-bold text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Họ tên *</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Số điện thoại</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Ngày sinh</div>
                  <input
                    type="date"
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Giới tính</div>
                  <select
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 font-semibold text-slate-700">CCCD</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.citizenId}
                    onChange={(e) => setForm({ ...form, citizenId: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Mã BHYT</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.healthInsuranceCode}
                    onChange={(e) => setForm({ ...form, healthInsuranceCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Dân tộc</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.ethnicity}
                    onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
                  />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Địa chỉ</div>
                  <input
                    className="w-full rounded-xl border px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-emerald-200"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              <label className="mt-1 flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                />
                Đặt làm hồ sơ mặc định
              </label>

              {err ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                  {err}
                </div>
              ) : null}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  disabled={saving}
                  onClick={save}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
