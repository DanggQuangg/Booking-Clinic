import { http } from "./http";

export const paymentsApi = {
  confirmAppointmentPayment(appointmentId, method) {
    return http.post(`/api/payments/appointments/${appointmentId}/confirm`, { method });
  },
};
