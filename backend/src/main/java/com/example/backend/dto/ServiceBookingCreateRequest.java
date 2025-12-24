package com.example.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceBookingCreateRequest {
    @NotNull
    private Long serviceSlotId;

    @NotNull
    private Long patientProfileId;

    @Min(1) @Max(10)
    private Integer quantity = 1;

    private String note;
}
