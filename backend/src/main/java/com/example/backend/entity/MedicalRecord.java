package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records", uniqueConstraints = {
        @UniqueConstraint(name = "uk_record_per_appt", columnNames = "appointment_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    // --- FIX LỖI MAPPING ---

    // 1. Cột thô để lưu ID profile
    @Column(name = "patient_profile_id", nullable = false)
    private Long patientProfileId;

    // 2. Quan hệ User để lưu User ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patientUser;

    // 3. Quan hệ Profile READ-ONLY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "patient_profile_id", referencedColumnName = "id", insertable = false, updatable = false),
            @JoinColumn(name = "patient_user_id", referencedColumnName = "owner_user_id", insertable = false, updatable = false)
    })
    private PatientProfile patientProfile;
    // -----------------------

    @Lob
    @Column(name = "diagnosis")
    private String diagnosis;

    @Lob
    @Column(name = "conclusion")
    private String conclusion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}