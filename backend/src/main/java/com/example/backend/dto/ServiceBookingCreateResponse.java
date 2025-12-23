package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServiceBookingCreateResponse {
    private Long id;
    private Long serviceId;
    private Long serviceSlotId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private String status;
}
