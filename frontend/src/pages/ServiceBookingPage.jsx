import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { servicesApi } from "../api/servicesApi";
import { patientProfilesApi } from "../api/patientProfilesApi";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function ServiceBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [service, setService] = useState(null);

  // profiles
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesErr, setProfilesErr] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [patientProfileId, setPatientProfileId] = useState("");

  // booking fields
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotErr, setSlotErr] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // 1) load service
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const s = await servicesApi.detail(id);
        if (!mounted) return;
        setService(s);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Không tải được dịch vụ");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // 2) load my profiles
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setProfilesLoading(true);
        setProfilesErr("");

        const data = await patientProfilesApi.listMine();
        if (!mounted) return;

        const list = Array.isArray(data) ? data : data?.items || [];
        setProfiles(list);

        // auto pick default profile (or first)
        const def = list.find((p) => p?.isDefault);
        const pick = def?.id ?? list[0]?.id ?? "";
        setPatientProfileId(pick ? String(pick) : "");
      } catch (e) {
        if (!mounted) return;
        setProfilesErr(e?.message || "Không tải được hồ sơ bệnh nhân");
      } finally {
        if (mounted) setProfilesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Không dùng requires_booking nữa → coi tất cả đều đặt theo giờ
  const requiresBooking = useMemo(() => true, []);

  // 3) load slots by date
  useEffect(() => {
    let mounted = true;
    if (!service || !requiresBooking) return;

    (async () => {
      try {
        setSlotLoading(true);
        setSlotErr("");
        setSelectedSlotId(null);

        const data = await servicesApi.slots(id, date);
        if (!mounted) return;

        const list = Array.isArray(data) ? data : data?.items || [];
        setSlots(list);
      } catch (e) {
        if (!mounted) return;
        setSlotErr(e?.message || "Không tải được lịch giờ của dịch vụ");
      } finally {
        if (mounted) setSlotLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [service, requiresBooking, id, date]);

  const submitBooking = async () => {
    setErr("");

    if (!patientProfileId) {
      setErr("Bạn chưa chọn hồ sơ bệnh nhân.");
      return;
    }
    if (!selectedSlotId) {
      setErr("Bạn chưa chọn khung giờ.");
      return;
    }
    if (!quantity || quantity < 1) {
      setErr("Số lượng phải >= 1.");
      return;
    }

    try {
      const payload = {
        serviceSlotId: selectedSlotId,
        patientProfileId: Number(patientProfileId),
        quantity,
        note,
        // appointmentId: ... (nếu sau này bạn muốn gắn với appointment)
      };

      await servicesApi.createBooking(payload);

      alert("Đặt dịch vụ thành công!");
      navigate("/account/payments");
    } catch (e) {
      setErr(e?.message || "Đặt dịch vụ thất bại");
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
            Đang tải…
          </div>
        ) : err && !service ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {err}
          </div>
        ) : (
          <>
            <button
              className="text-sm font-extrabold text-sky-700 hover:underline"
              onClick={() => navigate("/services")}
              type="button"
            >
              ← Quay lại danh sách
            </button>

            <div className="mt-3 rounded-2xl border bg-white p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{service?.name}</h1>
                  <p className="mt-1 text-slate-600">{service?.description || "—"}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">GIÁ</div>
                  <div className="text-2xl font-black text-sky-700">
                    {Number(service?.price || 0).toLocaleString("vi-VN")}₫
                  </div>
                </div>
              </div>

              {(err || profilesErr) && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                  {err || profilesErr}
                </div>
              )}

              {/* chọn hồ sơ */}
              <div className="mt-5 rounded-2xl border p-4">
                <div className="text-sm font-extrabold text-slate-900">Hồ sơ bệnh nhân</div>

                {profilesLoading ? (
                  <div className="mt-2 text-slate-600">Đang tải hồ sơ…</div>
                ) : profiles.length === 0 ? (
                  <div className="mt-2 text-slate-600">
                    Bạn chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ trong trang Tài khoản/Profile.
                  </div>
                ) : (
                  <select
                    value={patientProfileId}
                    onChange={(e) => setPatientProfileId(e.target.value)}
                    className="mt-2 w-full rounded-xl border bg-white px-3 py-2 font-semibold"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.fullName} {p.dob ? `- ${p.dob}` : ""} {p.isDefault ? "(Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* đặt theo giờ */}
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-extrabold text-slate-900">Chọn ngày</div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border px-3 py-2 font-semibold"
                  />
                  {slotErr ? (
                    <div className="mt-2 text-sm font-semibold text-red-700">{slotErr}</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border p-4 md:col-span-2">
                  <div className="text-sm font-extrabold text-slate-900">Chọn khung giờ</div>

                  {slotLoading ? (
                    <div className="mt-2 text-slate-600">Đang tải khung giờ…</div>
                  ) : slots.length === 0 ? (
                    <div className="mt-2 text-slate-500">Không có slot cho ngày này.</div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {slots.map((sl) => {
                        const sid = sl?.id;
                        const start = sl?.startTime ?? sl?.start_time;
                        const end = sl?.endTime ?? sl?.end_time;
                        const cap = sl?.capacity;

                        const active = selectedSlotId === sid;
                        const cls = active
                          ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100"
                          : "hover:bg-slate-50";

                        return (
                          <button
                            key={sid}
                            type="button"
                            onClick={() => setSelectedSlotId(sid)}
                            className={`rounded-2xl border p-3 text-left transition ${cls}`}
                          >
                            <div className="font-extrabold text-slate-900">
                              {start} - {end}
                            </div>
                            {typeof cap !== "undefined" ? (
                              <div className="mt-1 text-xs text-slate-600">Sức chứa: {cap}</div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-extrabold text-slate-900">Số lượng</div>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value || 1))}
                    className="mt-2 w-full rounded-xl border px-3 py-2 font-semibold"
                  />
                </div>

                <div className="rounded-2xl border p-4 md:col-span-2">
                  <div className="text-sm font-extrabold text-slate-900">Ghi chú</div>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhịn ăn trước khi xét nghiệm"
                    className="mt-2 w-full rounded-xl border px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={profilesLoading || profiles.length === 0}
                  className="rounded-2xl bg-sky-600 px-5 py-3 font-extrabold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  Xác nhận đặt dịch vụ
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
