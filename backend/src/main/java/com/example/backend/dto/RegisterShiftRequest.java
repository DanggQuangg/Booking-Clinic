package com.example.backend.dto;

import com.example.backend.entity.ShiftType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class RegisterShiftRequest {
    @NotNull
    private LocalDate workDate;

    @NotNull
    private ShiftType shift;

    public LocalDate getWorkDate() { return workDate; }
    public void setWorkDate(LocalDate workDate) { this.workDate = workDate; }

    public ShiftType getShift() { return shift; }
    public void setShift(ShiftType shift) { this.shift = shift; }
}
