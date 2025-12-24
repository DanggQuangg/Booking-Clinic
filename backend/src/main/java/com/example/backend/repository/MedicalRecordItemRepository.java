package com.example.backend.repository;

import com.example.backend.entity.MedicalRecordItem;
import com.example.backend.entity.MedicalRecordItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordItemRepository extends JpaRepository<MedicalRecordItem, Long> {
    List<MedicalRecordItem> findByRecord_IdAndItemTypeOrderByCreatedAtAsc(Long recordId, MedicalRecordItemType itemType);
}
