package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateMeRequest(
        @NotBlank String fullName,
        @Email String email
) {}
