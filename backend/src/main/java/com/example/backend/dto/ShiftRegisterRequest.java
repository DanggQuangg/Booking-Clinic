package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ShiftRegisterRequest {
    private LocalDate workDate;
    private String shift; // "MORNING", "AFTERNOON"
}