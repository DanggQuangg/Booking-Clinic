package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_record_items",
        indexes = @Index(name = "idx_record_items", columnList = "record_id, item_type")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalRecordItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MedicalRecord record;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private MedicalRecordItemType itemType;

    @Column(name = "item_key", length = 100)
    private String itemKey;

    @Lob
    @Column(name = "item_value")
    private String itemValue;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;
}

