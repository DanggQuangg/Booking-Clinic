package com.example.backend.service;

import com.example.backend.dto.PrescriptionItemDto;
import com.example.backend.entity.MedicalRecord;
import com.example.backend.entity.MedicalRecordItem;
import com.example.backend.entity.MedicalRecordItemType;
import com.example.backend.repository.MedicalRecordItemRepository;
import com.example.backend.repository.MedicalRecordRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientPrescriptionService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordItemRepository medicalRecordItemRepository;

    public PatientPrescriptionService(
            MedicalRecordRepository medicalRecordRepository,
            MedicalRecordItemRepository medicalRecordItemRepository
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicalRecordItemRepository = medicalRecordItemRepository;
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) throw new RuntimeException("Unauthenticated");
        return (Long) auth.getPrincipal();
    }

    public List<PrescriptionItemDto> getPrescriptionsForAppointment(Long appointmentId) {
        Long userId = currentUserId();

        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElse(null);

        if (record == null) return List.of();

        // đảm bảo bệnh nhân chỉ xem record của chính mình
        if (record.getPatientUser() == null || record.getPatientUser().getId() == null
                || !record.getPatientUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        List<MedicalRecordItem> items =
                medicalRecordItemRepository.findByRecord_IdAndItemTypeOrderByCreatedAtAsc(
                        record.getId(), MedicalRecordItemType.PRESCRIPTION
                );

        return items.stream()
                .map(i -> new PrescriptionItemDto(i.getId(), i.getItemKey(), i.getItemValue(), i.getCreatedAt()))
                .toList();
    }
}
