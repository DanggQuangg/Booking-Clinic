package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patient_account_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientAccountProfile {

    @Id
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "dob")
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "address", length = 255)
    private String address;
}
