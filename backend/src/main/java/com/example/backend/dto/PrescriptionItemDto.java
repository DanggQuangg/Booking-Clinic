package com.example.backend.dto;

import java.time.LocalDateTime;

public record PrescriptionItemDto(
        Long id,
        String itemKey,
        String itemValue,
        LocalDateTime createdAt
) {}
