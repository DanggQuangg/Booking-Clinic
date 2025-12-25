package com.example.backend.dto;

import com.example.backend.entity.ShiftType;
import com.example.backend.entity.WorkShiftStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DoctorShiftItemDto {
    private Long id;
    private LocalDate workDate;
    private ShiftType shift;
    private WorkShiftStatus status;

    private LocalTime doctorStartTime;
    private LocalTime doctorEndTime;

    private Long roomId;
    private String roomName;

    // ✅ NEW: ca này đã có bệnh nhân đặt lịch chưa?
    private boolean hasAppointment;
}
