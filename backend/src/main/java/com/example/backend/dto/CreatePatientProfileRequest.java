package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePatientProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 20) String phone,
        String dob,
        String gender,
        Boolean isDefault
) {}
