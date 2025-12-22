package com.example.backend.dto;

public record SlotAvailabilityDto(
        Long slotId,
        String startTime,
        String endTime,
        Long roomId,
        String roomName,
        int capacity,
        int remaining
) {}
