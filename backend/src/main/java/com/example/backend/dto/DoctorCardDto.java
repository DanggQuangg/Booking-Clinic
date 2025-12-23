package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record DoctorCardDto(
        Long doctorId,
        String fullName,
        String avatarUrl,
        String degree,
        String positionTitle,
        BigDecimal consultationFee,
        Boolean isVerified,
        List<SpecialtyDto> specialties
) {}
