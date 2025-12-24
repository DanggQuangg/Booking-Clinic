package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class MedicalRecordRequest {
    private Long appointmentId;
    private String diagnosis;
    private String conclusion;

    // optional: tái khám
    private Boolean createFollowUp;
    private LocalDate followUpDate;
    private Long followUpSlotId;
    private String followUpNote;

    // ✅ QUAN TRỌNG: FE kê thuốc + sinh hiệu sẽ nằm ở đây
    private List<MedicalRecordItemReq> items;
}
