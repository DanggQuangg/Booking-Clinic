package com.example.backend.dto;

public record MeResponse(
        Long id,
        String fullName,
        String phone,
        String email
) {}
