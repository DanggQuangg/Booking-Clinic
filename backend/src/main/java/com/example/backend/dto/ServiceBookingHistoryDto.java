package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServiceBookingHistoryDto {
    private Long id;

    private Long serviceId;
    private String serviceName;

    private Long serviceSlotId;
    private String slotDate;    // yyyy-MM-dd
    private String startTime;   // HH:mm:ss
    private String endTime;     // HH:mm:ss

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    private String status;      // BOOKED/DONE/CANCELLED
    private String note;

    private String createdAt;   // yyyy-MM-ddTHH:mm:ss
}
