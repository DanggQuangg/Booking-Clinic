package com.example.backend.dto;

import lombok.Data;

@Data
public class DoctorDashboardDto {
    private String doctorName;
    private String employmentType; // "FULL_TIME" hoặc "PART_TIME"
}