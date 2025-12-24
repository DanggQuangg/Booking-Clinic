package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_employment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorEmployment {

    @Id
    @Column(name = "doctor_id")
    private Long doctorId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType; 

    @Column(name = "fixed_full_time")
    private Boolean fixedFullTime;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum EmploymentType {
        FULL_TIME, PART_TIME
    }
}