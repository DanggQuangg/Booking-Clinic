package com.example.backend.dto;

public record AuthResponse(
        String fullName,
        String phone,
        String email,
        String token
) {}
