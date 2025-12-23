package com.example.backend.dto;

public record PatientProfileDto(
        Long id,
        String fullName,
        String phone,
        String dob,
        String gender,
        Boolean isDefault
) {}
