package com.example.backend.dto;

import java.math.BigDecimal;

public record DoctorPublicDto(
        Long doctorId,
        String fullName,
        String avatarUrl,
        String degree,
        String positionTitle,
        BigDecimal consultationFee,
        Boolean isVerified
) {}
