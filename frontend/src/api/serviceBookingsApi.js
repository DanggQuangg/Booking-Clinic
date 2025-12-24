import { apiGet } from "../lib/api";

export const serviceBookingsApi = {
  myHistory: ({ q, from, to, status, sort, page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (status && status !== "ALL") params.set("status", status);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("size", String(size));

    return apiGet(`/api/service-bookings/my?${params.toString()}`);
  },
};
