package com.example.backend.dto;

import lombok.Data;

@Data
public class PaymentConfirmRequest {
    // FE gửi "CASH" hoặc "TRANSFER"
    private String method;
}
