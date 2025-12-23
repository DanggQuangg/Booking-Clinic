package com.example.backend.dto;

public record PatientProfileDto(
        Long id,
        String fullName,
        String phone,
        String dob,
        String gender,
        String healthInsuranceCode,
        String citizenId,
        String address,
        String ethnicity,
        Boolean isDefault
) {}
