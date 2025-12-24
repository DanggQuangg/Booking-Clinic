// DoctorShiftSlotDto.java
package com.example.backend.dto;

import java.util.List;

public record DoctorShiftSlotDto(
        Long workShiftId,
        String workDate,      // "2025-12-24"
        String shift,         // "MORNING" | "AFTERNOON"
        String doctorStartTime, // "07:00:00"
        String doctorEndTime,   // "11:30:00"
        Long roomId,
        String roomName,
        List<SlotDto> slots
) {
    public record SlotDto(
            Long id,
            String startTime,  // "07:30:00"
            String endTime,    // "08:30:00"
            Integer capacity,
            String status      // "ACTIVE" | "INACTIVE"
    ) {}
}
