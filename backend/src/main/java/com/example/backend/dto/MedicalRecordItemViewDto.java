package com.example.backend.dto;

import lombok.Data;

@Data
public class MedicalRecordItemViewDto {
    private String itemType;   // VITAL_SIGN | PRESCRIPTION | TEST | NOTE | SYMPTOM
    private String itemKey;
    private String itemValue;
}
