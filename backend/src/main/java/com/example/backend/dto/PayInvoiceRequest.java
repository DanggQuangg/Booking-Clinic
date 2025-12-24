package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;

public class PayInvoiceRequest {
    private Long appointmentId;
    private String method; // CASH/BANK_TRANSFER/MOMO/...

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}

