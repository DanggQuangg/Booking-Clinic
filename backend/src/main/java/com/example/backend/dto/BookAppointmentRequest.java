package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookAppointmentRequest(
        @NotNull Long patientProfileId,
        @NotNull Long specialtyId,
        @NotNull Long doctorId,
        @NotNull Long slotId,
        @NotNull LocalDate appointmentDate,

        @NotNull Boolean insuranceUsed,
        BigDecimal insuranceDiscount,

        @Size(max = 500) String note
) {}
