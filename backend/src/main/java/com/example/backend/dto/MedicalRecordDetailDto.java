package com.example.backend.dto;

import com.example.backend.entity.MedicalRecord;
import com.example.backend.entity.MedicalRecordItem;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class MedicalRecordDetailDto {
    private Long recordId;
    private Long appointmentId;
    private String doctorName;
    private String diagnosis;
    private String conclusion;
    private LocalDateTime createdAt;
    private List<ItemDto> items = new ArrayList<>();

    @Data
    public static class ItemDto {
        private String itemType; // SYMPTOM/VITAL_SIGN/TEST/PRESCRIPTION/NOTE
        private String itemKey;
        private String itemValue;
    }

    public static MedicalRecordDetailDto from(MedicalRecord r, List<MedicalRecordItem> items) {
        MedicalRecordDetailDto dto = new MedicalRecordDetailDto();
        dto.setRecordId(r.getId());
        dto.setAppointmentId(r.getAppointment().getId());
        dto.setDoctorName(r.getDoctor() != null ? r.getDoctor().getFullName() : null);
        dto.setDiagnosis(r.getDiagnosis());
        dto.setConclusion(r.getConclusion());
        dto.setCreatedAt(r.getCreatedAt());

        if (items != null) {
            for (MedicalRecordItem it : items) {
                ItemDto x = new ItemDto();
                x.setItemType(it.getItemType() != null ? it.getItemType().name() : null);
                x.setItemKey(it.getItemKey());
                x.setItemValue(it.getItemValue());
                dto.getItems().add(x);
            }
        }
        return dto;
    }
}
