package com.example.backend.controller;

import com.example.backend.JwtUtil;
import com.example.backend.dto.MedicalRecordDetailDto;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.MedicalRecord;
import com.example.backend.entity.MedicalRecordItem;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.MedicalRecordItemRepository;
import com.example.backend.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientMedicalRecordController {

    private final JwtUtil jwtUtil;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordItemRepository medicalRecordItemRepository;

    private Long getUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.getUserId(authHeader.substring(7));
        }
        throw new RuntimeException("Unauthorized: Token is missing or invalid");
    }

    @GetMapping("/appointments/{appointmentId}/record")
    public ResponseEntity<?> getRecordForPatient(
            @RequestHeader("Authorization") String token,
            @PathVariable Long appointmentId
    ) {
        Long userId = getUserId(token);

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment không tồn tại"));

        // ✅ Chặn xem trộm: appointment phải thuộc user này
        if (appt.getPatientUser() == null || appt.getPatientUser().getId() == null
                || !appt.getPatientUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bệnh án");
        }

        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Chưa có bệnh án cho lịch này"));

        List<MedicalRecordItem> items = medicalRecordItemRepository.findByRecordIdOrderByIdAsc(record.getId());

        return ResponseEntity.ok(MedicalRecordDetailDto.from(record, items));
    }
}
