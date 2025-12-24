package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;

public class PayRequest {

    @NotNull
    private Long appointmentId;

    @NotNull
    private String method; // CASH/BANK_TRANSFER/MOMO/ZALOPAY/VNPAY/CARD

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}
