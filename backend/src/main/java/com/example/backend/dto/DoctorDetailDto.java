package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record DoctorDetailDto(
        Long id,
        String fullName,
        String email,
        String gender,
        String dob,
        String avatarUrl,
        String degree,
        String positionTitle,
        String bio,
        Object consultationFee,
        Boolean isVerified,
        List<SpecialtyDto> specialties,
        List<DoctorShiftSlotDto> schedule
) {
    public record WeeklySlotDto(
            Long id,
            Integer dayOfWeek,
            String startTime,
            String endTime,
            String roomName,
            Integer capacity,
            String status
    ) {}
}
