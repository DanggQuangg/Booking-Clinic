package com.example.backend.repository;

import com.example.backend.entity.MedicalRecordItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordItemRepository extends JpaRepository<MedicalRecordItem, Long> {
    List<MedicalRecordItem> findByRecordIdOrderByIdAsc(Long recordId);
}
