package com.example.backend.dto;

public record PatientProfileStatsDto(
        Long id,
        String fullName,
        String phone,
        String dob,
        String gender,
        String healthInsuranceCode,
        String citizenId,
        String address,
        String ethnicity,
        Boolean isDefault,

        Long countNotVisited,   // chưa khám
        Long countDone,         // đã khám
        Long countUpcoming      // lịch hẹn (tương lai)
) {}
