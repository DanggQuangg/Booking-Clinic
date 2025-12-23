package com.example.backend.repository;

import com.example.backend.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    @Query("select dp.consultationFee from DoctorProfile dp where dp.userId = :userId")
    Optional<BigDecimal> findConsultationFeeByUserId(@Param("userId") Long userId);
}
