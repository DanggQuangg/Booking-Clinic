package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_phone_norm", columnNames = "phone_normalized"),
        @UniqueConstraint(name = "uk_users_email_norm", columnNames = "email_normalized")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "email", length = 120)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.PATIENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Generated Columns
    @Column(name = "phone_normalized", insertable = false, updatable = false)
    private String phoneNormalized;

    @Column(name = "email_normalized", insertable = false, updatable = false)
    private String emailNormalized;

    // Relationships (Optional, nếu bạn không cần truy vấn ngược thì có thể bỏ)
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private DoctorProfile doctorProfile;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private PatientAccountProfile patientAccountProfile;
}