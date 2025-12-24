package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public interface InvoiceDto {
    Long getAppointmentId();
    String getPatientName();
    String getDoctorName();
    String getSpecialtyName();

    LocalDate getAppointmentDate();
    LocalTime getStartTime();
    LocalTime getEndTime();

    BigDecimal getBaseFee();
    BigDecimal getInsuranceDiscount();
    BigDecimal getServicesAmount();
    BigDecimal getTotalAmount();

    String getPaymentStatus();      // UNPAID / PAID / FAILED / REFUNDED
    LocalDateTime getPaidAt();
}
