package com.example.backend.repository;

import com.example.backend.entity.MedicalRecordItem;
import com.example.backend.entity.MedicalRecordItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordItemRepository extends JpaRepository<MedicalRecordItem, Long> {

    // HEAD: lấy items theo record + type, sort theo thời gian tạo
    List<MedicalRecordItem> findByRecord_IdAndItemTypeOrderByCreatedAtAsc(Long recordId, MedicalRecordItemType itemType);

    // origin/dlhd: lấy tất cả items theo record, sort theo id
    List<MedicalRecordItem> findByRecordIdOrderByIdAsc(Long recordId);
}
