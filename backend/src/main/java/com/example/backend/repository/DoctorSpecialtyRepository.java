package com.example.backend.repository;

import com.example.backend.entity.DoctorSpecialty;
import com.example.backend.entity.DoctorSpecialtyId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorSpecialtyRepository extends JpaRepository<DoctorSpecialty, DoctorSpecialtyId> {
    boolean existsByDoctor_IdAndSpecialty_Id(Long doctorId, Long specialtyId);
    List<DoctorSpecialty> findAllByDoctor_Id(Long doctorId);
}
