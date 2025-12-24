package com.example.backend.repository;

import com.example.backend.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {

    List<PatientProfile> findByOwnerUser_IdOrderByIsDefaultDescIdAsc(Long ownerUserId);

    Optional<PatientProfile> findByIdAndOwnerUser_Id(Long id, Long ownerUserId);

    boolean existsByCitizenId(String citizenId);

    boolean existsByHealthInsuranceCode(String healthInsuranceCode);

    @Modifying
    @Query("update PatientProfile p set p.isDefault = false where p.ownerUser.id = :userId")
    void clearDefaultForUser(@Param("userId") Long userId);
    List<PatientProfile> findByOwnerUser_IdOrderByIsDefaultDescCreatedAtDesc(Long ownerUserId);



    boolean existsByCitizenIdAndIdNot(String citizenId, Long id);
    boolean existsByHealthInsuranceCodeAndIdNot(String healthInsuranceCode, Long id);
}
