package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreatePatientProfileRequest(
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String phone,
        LocalDate dob,
        String gender,      // "MALE"/"FEMALE"/"OTHER"
        Boolean isDefault
) {}
