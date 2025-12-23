package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record PatientAppointmentDto(
        Long id,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,

        Long patientProfileId,
        String patientProfileName,

        Long doctorId,
        String doctorName,

        Long specialtyId,
        String specialtyName,

        Long roomId,
        String roomName,

        String status,
        String paymentStatus,

        BigDecimal totalAmount,
        BigDecimal baseFee,
        BigDecimal insuranceDiscount,
        BigDecimal servicesAmount,

        String note,
        LocalDateTime createdAt
) {}
