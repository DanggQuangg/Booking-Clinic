package com.example.backend.dto;

import lombok.Data;

@Data
public class SaveMedicalRecordResponse {
    private Long recordId;
    private Long followUpAppointmentId; // null nếu không tạo
    private String message;
}
