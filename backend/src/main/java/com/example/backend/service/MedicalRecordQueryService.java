package com.example.backend.service;

import com.example.backend.dto.MedicalRecordDetailDto;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.MedicalRecord;
import com.example.backend.entity.MedicalRecordItem;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.MedicalRecordItemRepository;
import com.example.backend.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordQueryService {

    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordItemRepository medicalRecordItemRepository;

    // PATIENT xem bệnh án (chỉ xem bệnh án của mình)
    public MedicalRecordDetailDto getForPatient(Long patientUserId, Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch #" + appointmentId));

        if (appt.getPatientUser() == null || appt.getPatientUser().getId() == null
                || !appt.getPatientUser().getId().equals(patientUserId)) {
            throw new RuntimeException("Không có quyền xem bệnh án lịch này");
        }

        return buildDto(appointmentId);
    }

    // DOCTOR xem bệnh án (chỉ xem bệnh án của lịch thuộc bác sĩ đó)
    public MedicalRecordDetailDto getForDoctor(Long doctorId, Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch #" + appointmentId));

        if (appt.getDoctor() == null || appt.getDoctor().getId() == null
                || !appt.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Không có quyền xem bệnh án lịch này");
        }

        return buildDto(appointmentId);
    }

    private MedicalRecordDetailDto buildDto(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Lịch này chưa có bệnh án"));

        var items = medicalRecordItemRepository.findByRecordIdOrderByIdAsc(record.getId());

        MedicalRecordDetailDto dto = new MedicalRecordDetailDto();
        dto.setRecordId(record.getId());
        dto.setAppointmentId(appointmentId);
        dto.setDiagnosis(record.getDiagnosis());
        dto.setConclusion(record.getConclusion());
        dto.setCreatedAt(record.getCreatedAt());

        dto.setItems(items.stream().map(this::mapItem).collect(Collectors.toList()));
        return dto;
    }

    private MedicalRecordDetailDto.ItemDto mapItem(MedicalRecordItem it) {
        MedicalRecordDetailDto.ItemDto x = new MedicalRecordDetailDto.ItemDto();
        x.setItemType(it.getItemType() != null ? it.getItemType().name() : null);
        x.setItemKey(it.getItemKey());
        x.setItemValue(it.getItemValue());
        return x;
    }
}
