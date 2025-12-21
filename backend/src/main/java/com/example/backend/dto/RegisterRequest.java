package com.example.backend.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @Email @NotBlank String email,
        @NotBlank String password
) {}

