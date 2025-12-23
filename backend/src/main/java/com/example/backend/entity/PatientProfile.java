package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_profiles",
        indexes = {
                @Index(name = "idx_patient_profiles_owner", columnList = "owner_user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_patient_profile_cccd", columnNames = "citizen_id"),
                @UniqueConstraint(name = "uk_patient_profile_bhyt", columnNames = "health_insurance_code"),
                @UniqueConstraint(name = "uk_owner_default_profile", columnNames = {"owner_user_id", "default_marker"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- QUAN TRỌNG: Mapping User (Object) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    // --- THÊM MỚI: Mapping ID (Shadow Field) ---
    // Mục đích: Để Appointment và MedicalRecord có thể tham chiếu tới cột "owner_user_id" này
    // thông qua thuộc tính referencedColumnName="owner_user_id"
    @Column(name = "owner_user_id", insertable = false, updatable = false)
    private Long ownerUserId;
    // ----------------------------------------

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "dob")
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "health_insurance_code", length = 30)
    private String healthInsuranceCode;

    @Column(name = "citizen_id", length = 20)
    private String citizenId;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "ethnicity", length = 60)
    private String ethnicity;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Generated Columns (Read-only)
    @Column(name = "phone_normalized", insertable = false, updatable = false)
    private String phoneNormalized;

    @Column(name = "default_marker", insertable = false, updatable = false)
    private Integer defaultMarker;
}