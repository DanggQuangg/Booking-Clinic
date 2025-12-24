package com.example.backend.dto;

import java.time.LocalDateTime;

public class PayInvoiceResponse {
    private String result;           // SUCCESS / ALREADY_PAID
    private Long appointmentId;
    private String paymentStatus;    // PAID
    private LocalDateTime paidAt;

    public PayInvoiceResponse(String result, Long appointmentId, String paymentStatus, LocalDateTime paidAt) {
        this.result = result;
        this.appointmentId = appointmentId;
        this.paymentStatus = paymentStatus;
        this.paidAt = paidAt;
    }

    public String getResult() { return result; }
    public Long getAppointmentId() { return appointmentId; }
    public String getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getPaidAt() { return paidAt; }
}
