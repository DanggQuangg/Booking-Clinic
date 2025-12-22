package com.example.backend.dto;

import java.math.BigDecimal;

public record InvoiceDto(
        Long appointmentId,
        String patientName,
        String doctorName,
        String specialtyName,
        String appointmentDate,
        String startTime,
        String endTime,
        BigDecimal baseFee,
        BigDecimal insuranceDiscount,
        BigDecimal servicesAmount,
        BigDecimal totalAmount
) {}
