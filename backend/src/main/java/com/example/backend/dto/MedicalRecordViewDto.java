package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class MedicalRecordViewDto {
    private Long id;
    private Long appointmentId;
    private String diagnosis;
    private String conclusion;
    private List<MedicalRecordItemViewDto> items;
}
