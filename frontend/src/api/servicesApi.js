// src/api/servicesApi.js
import { apiGet, apiPost } from "../lib/api"; 
// 👆 đổi "./api" đúng theo file bạn đang đặt đoạn code kia
// ví dụ: "../lib/api" hoặc "./client" tuỳ project bạn

export const servicesApi = {
  list: () => apiGet("/api/services"),
  detail: (id) => apiGet(`/api/services/${id}`),
  slots: (serviceId, date) =>
    apiGet(`/api/services/${serviceId}/time-slots?date=${encodeURIComponent(date)}`),
  createBooking: (payload) => apiPost("/api/service-bookings", payload),
};
