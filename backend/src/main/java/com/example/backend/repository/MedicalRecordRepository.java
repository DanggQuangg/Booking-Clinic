package com.example.backend.repository;

import com.example.backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    boolean existsByAppointmentId(Long appointmentId);
}
