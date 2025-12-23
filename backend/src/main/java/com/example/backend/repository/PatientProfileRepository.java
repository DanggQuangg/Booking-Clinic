package com.example.backend.repository;

import com.example.backend.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    List<PatientProfile> findByOwnerUser_IdOrderByIsDefaultDescIdAsc(Long ownerUserId);
    Optional<PatientProfile> findByIdAndOwnerUser_Id(Long id, Long ownerUserId);
}
