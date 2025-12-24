package com.example.backend.repository;

import com.example.backend.entity.DoctorEmployment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorEmploymentRepository extends JpaRepository<DoctorEmployment, Long> {
}