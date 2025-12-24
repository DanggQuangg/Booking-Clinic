package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreatePatientProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 20) String phone,
        LocalDate dob,

        // "MALE"/"FEMALE"/"OTHER"
        String gender,

        @Size(max = 30) String healthInsuranceCode,
        @Size(max = 20) String citizenId,
        @Size(max = 255) String address,
        @Size(max = 60) String ethnicity,

        Boolean isDefault
) {}
