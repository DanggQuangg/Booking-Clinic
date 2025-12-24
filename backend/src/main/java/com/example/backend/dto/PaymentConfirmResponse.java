package com.example.backend.dto;

import lombok.Data;

@Data
public class PaymentConfirmResponse {
    private Long appointmentId;
    private String status;        // CONFIRMED
    private String paymentStatus; // PAID
    private String method;        // CASH / TRANSFER
    private String message;
}
