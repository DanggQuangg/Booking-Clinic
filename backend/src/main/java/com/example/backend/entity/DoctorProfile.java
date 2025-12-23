package com.example.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorProfile {

    @Id
    // Bỏ @Column(name="user_id") ở đây đi để tránh xung đột với @JoinColumn bên dưới
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "position_title", length = 120)
    private String positionTitle;

    @Lob
    @Column(name = "bio")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "consultation_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal consultationFee = BigDecimal.ZERO;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
}
