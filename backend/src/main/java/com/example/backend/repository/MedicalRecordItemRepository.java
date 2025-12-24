package com.example.backend.repository;

import com.example.backend.entity.MedicalRecordItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordItemRepository extends JpaRepository<MedicalRecordItem, Long> {
}