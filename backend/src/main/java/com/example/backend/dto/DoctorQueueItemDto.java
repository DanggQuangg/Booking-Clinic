package com.example.backend.dto;

import lombok.Data;

@Data
public class DoctorQueueItemDto {
    private Long appointmentId;
    private String timeSlot;    // VD: "08:00 - 08:30"
    private String patientName;
    private String gender;      // MALE, FEMALE
    private int age;
    private String status;      // CONFIRMED, AWAITING_PAYMENT
    private String reason;      // Lấy từ cột note
}