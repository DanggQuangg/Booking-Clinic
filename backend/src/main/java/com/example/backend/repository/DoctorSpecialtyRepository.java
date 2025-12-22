package com.example.backend.repository;

import com.example.backend.entity.DoctorSpecialty;
import com.example.backend.entity.DoctorSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorSpecialtyRepository extends JpaRepository<DoctorSpecialty, DoctorSpecialtyId> {
    boolean existsByDoctor_IdAndSpecialty_Id(Long doctorId, Long specialtyId);
}
