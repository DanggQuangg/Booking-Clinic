package com.example.backend.dto;

import com.example.backend.entity.ServiceTimeSlot;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ServiceTimeSlotDto {
    private Long id;
    private String slotDate;
    private String startTime;
    private String endTime;
    private Integer capacity;
    private Long roomId;

    public static ServiceTimeSlotDto from(ServiceTimeSlot sl) {
        return ServiceTimeSlotDto.builder()
                .id(sl.getId())
                .slotDate(sl.getSlotDate() == null ? null : sl.getSlotDate().toString())
                .startTime(sl.getStartTime() == null ? null : sl.getStartTime().toString())
                .endTime(sl.getEndTime() == null ? null : sl.getEndTime().toString())
                .capacity(sl.getCapacity())
                .roomId(sl.getRoom() == null ? null : sl.getRoom().getId())
                .build();
    }
}
