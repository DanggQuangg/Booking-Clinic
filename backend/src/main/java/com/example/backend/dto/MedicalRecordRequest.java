package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MedicalRecordRequest {
    private Long appointmentId;
    private String diagnosis;
    private String conclusion;
    private List<ItemRequest> items;

    // --- TÁI KHÁM (optional) ---
    private Boolean createFollowUp;     // true/false
    private LocalDate followUpDate;     // appointment_date
    private Long followUpSlotId;        // slot_id
    private String followUpNote;        // note

    @Data
    public static class ItemRequest {
        private String itemType;  // SYMPTOM, VITAL_SIGN, TEST, PRESCRIPTION, NOTE
        private String itemKey;
        private String itemValue;
    }
}
