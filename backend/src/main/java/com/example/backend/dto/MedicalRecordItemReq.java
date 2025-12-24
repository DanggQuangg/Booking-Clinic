package com.example.backend.dto;

import lombok.Data;

@Data
public class MedicalRecordItemReq {
    private String itemType;   // VITAL_SIGN | PRESCRIPTION | ...
    private String itemKey;    // "Nhiệt độ" | "Paradol" | ...
    private String itemValue;  // "36.8°C" | "SL:1 - Uống sau ăn" | ...
}
