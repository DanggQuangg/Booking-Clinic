package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor_specialties")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorSpecialty {

    @EmbeddedId
    private DoctorSpecialtyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("doctorId")
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("specialtyId")
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;
}

