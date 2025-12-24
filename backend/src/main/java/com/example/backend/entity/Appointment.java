package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments",
        indexes = {
                @Index(name = "idx_appt_doctor_date_slot", columnList = "doctor_id, appointment_date, slot_id"),
                @Index(name = "idx_appt_patient_user", columnList = "patient_user_id, appointment_date"),
                @Index(name = "idx_appt_specialty", columnList = "specialty_id, appointment_date")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uk_profile_date_slot",
                columnNames = {"patient_profile_id", "appointment_date", "slot_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- KHỐI MAPPING ĐÃ TÁCH BIỆT (FIX LỖI) ---

    // 1. Dùng Field này để LƯU patient_profile_id vào DB
    @Column(name = "patient_profile_id", nullable = false)
    private Long patientProfileId;

    // 2. Dùng Field này để LƯU patient_user_id vào DB
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_user_id", nullable = false)
    private User patientUser;

    // 3. Object này chỉ dùng để JOIN lấy dữ liệu (READ-ONLY)
    // Cả 2 cột đều phải là insertable = false, updatable = false
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "patient_profile_id", referencedColumnName = "id", insertable = false, updatable = false),
            @JoinColumn(name = "patient_user_id", referencedColumnName = "owner_user_id", insertable = false, updatable = false)
    })
    private PatientProfile patientProfile;
    // -----------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private AppointmentSlot slot;

        @ManyToOne
        @JoinColumn(name = "room_id", nullable = false)
        private ClinicRoom room;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.AWAITING_PAYMENT;

    @Column(name = "base_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal baseFee = BigDecimal.ZERO;

    @Column(name = "insurance_used", nullable = false)
    @Builder.Default
    private Boolean insuranceUsed = false;

    @Column(name = "insurance_discount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal insuranceDiscount = BigDecimal.ZERO;

    @Column(name = "services_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal servicesAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private AppointmentPaymentStatus paymentStatus = AppointmentPaymentStatus.UNPAID;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "note", length = 500)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}